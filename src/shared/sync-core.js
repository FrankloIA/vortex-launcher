// Nucleo de sincronizacion compartido: descarga, verificacion SHA1 y limpieza de mods.
// Usado tanto por el launcher (cliente) como por sync-server.js (servidor Arclight).

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const http = require('http');

/** Descarga distribution.json remoto (con cache-buster para evitar CDN stale). */
async function fetchDistribution(url) {
  const fetch = require('node-fetch');
  const bustUrl = url + (url.includes('?') ? '&' : '?') + 't=' + Date.now();
  const res = await fetch(bustUrl, { headers: { 'Cache-Control': 'no-cache' } });
  if (!res.ok) {
    throw new Error(`No se pudo descargar distribution.json: HTTP ${res.status}`);
  }
  return res.json();
}

/** Calcula el SHA1 de un archivo local. Devuelve null si no existe. */
function sha1File(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha1').update(buffer).digest('hex');
}

/** Descarga un archivo desde una URL a una ruta local, siguiendo redirects. */
function downloadFile(url, destPath, onProgress) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(destPath), { recursive: true });
    const tmpPath = destPath + '.download';
    const client = url.startsWith('https') ? https : http;

    const request = (currentUrl, redirectCount = 0) => {
      if (redirectCount > 5) return reject(new Error('Demasiados redirects: ' + url));

      client.get(currentUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          response.resume();
          return request(response.headers.location, redirectCount + 1);
        }
        if (response.statusCode !== 200) {
          response.resume();
          return reject(new Error(`HTTP ${response.statusCode} descargando ${currentUrl}`));
        }

        const total = parseInt(response.headers['content-length'] || '0', 10);
        let downloaded = 0;
        const fileStream = fs.createWriteStream(tmpPath);

        response.on('data', (chunk) => {
          downloaded += chunk.length;
          if (onProgress) onProgress(downloaded, total);
        });

        response.pipe(fileStream);
        fileStream.on('finish', () => {
          fileStream.close(() => {
            fs.renameSync(tmpPath, destPath);
            resolve(destPath);
          });
        });
        fileStream.on('error', reject);
      }).on('error', reject);
    };

    request(url);
  });
}

/**
 * Filtra la lista de mods del distribution.json segun el entorno objetivo.
 * @param {Array} mods - lista "mods" del distribution.json
 * @param {'client'|'server'} target
 */
function filterModsByEnvironment(mods, target) {
  return (mods || []).filter((mod) => {
    const env = mod.environment || 'both';
    if (env === 'both') return true;
    if (target === 'client') return env === 'client_only';
    if (target === 'server') return env === 'server_only';
    return false;
  });
}

/**
 * Sincroniza una carpeta de mods contra la lista esperada: elimina sobrantes,
 * descarga faltantes o con SHA1 desincronizado, verifica hash tras descarga.
 * @param {Array} expectedMods - mods ya filtrados por entorno
 * @param {string} modsDir
 * @param {(msg: string) => void} log
 */
async function syncModsFolder(expectedMods, modsDir, log = console.log) {
  fs.mkdirSync(modsDir, { recursive: true });

  const expectedNames = new Set(expectedMods.map((m) => m.name));

  // 1. Eliminar archivos .jar que no pertenecen a la lista esperada
  const existingFiles = fs.readdirSync(modsDir).filter((f) => f.endsWith('.jar'));
  for (const file of existingFiles) {
    if (!expectedNames.has(file)) {
      log(`Eliminando mod obsoleto: ${file}`);
      fs.unlinkSync(path.join(modsDir, file));
    }
  }

  // 2. Descargar mods faltantes o con hash desincronizado
  for (const mod of expectedMods) {
    const destPath = path.join(modsDir, mod.name);
    const localHash = sha1File(destPath);

    if (localHash && mod.sha1 && localHash.toLowerCase() === mod.sha1.toLowerCase()) {
      continue; // ya actualizado
    }

    log(`Descargando mod: ${mod.name}`);
    await downloadFile(mod.url, destPath);

    if (mod.sha1) {
      const verifyHash = sha1File(destPath);
      if (verifyHash.toLowerCase() !== mod.sha1.toLowerCase()) {
        fs.unlinkSync(destPath);
        throw new Error(`SHA1 no coincide para ${mod.name} (esperado ${mod.sha1}, obtenido ${verifyHash})`);
      }
    }
  }
}

/** Descarga/sobrescribe archivos de configuracion listados en distribution.json. */
async function syncConfigs(configs, baseDir, log = console.log) {
  for (const cfg of configs || []) {
    const destPath = path.join(baseDir, cfg.path);
    log(`Actualizando config: ${cfg.path}`);
    await downloadFile(cfg.url, destPath);
    if (cfg.sha1) {
      const hash = sha1File(destPath);
      if (hash.toLowerCase() !== cfg.sha1.toLowerCase()) {
        throw new Error(`SHA1 no coincide para config ${cfg.path}`);
      }
    }
  }
}

module.exports = {
  fetchDistribution,
  sha1File,
  downloadFile,
  filterModsByEnvironment,
  syncModsFolder,
  syncConfigs
};
