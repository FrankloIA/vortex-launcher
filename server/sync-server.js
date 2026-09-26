#!/usr/bin/env node
// sync-server.js
// Script de sincronizacion para el servidor Arclight (NeoForge 1.21.1 + plugins).
// Lee el distribution.json remoto y sincroniza la carpeta mods/ del servidor:
// descarga mods "both" y "server_only", elimina lo que no pertenece, verifica SHA1.
//
// Uso:
//   node sync-server.js [--distribution-url=<url>] [--mods-dir=<ruta>]
//
// Pensado para ejecutarse manualmente o via cron/panel antes de cada arranque del servidor.

const path = require('path');
const { fetchDistribution, filterModsByEnvironment, syncModsFolder } = require('../src/shared/sync-core');
const { DISTRIBUTION_URL } = require('../src/shared/constants');

function parseArgs() {
  const args = {};
  for (const arg of process.argv.slice(2)) {
    const match = arg.match(/^--([^=]+)=(.*)$/);
    if (match) args[match[1]] = match[2];
  }
  return args;
}

async function main() {
  const args = parseArgs();
  const distributionUrl = args['distribution-url'] || DISTRIBUTION_URL;
  const modsDir = path.resolve(args['mods-dir'] || './mods');

  console.log(`[sync-server] Leyendo distribution.json desde: ${distributionUrl}`);
  const distribution = await fetchDistribution(distributionUrl);
  console.log(`[sync-server] Version del modpack: ${distribution.version}`);

  const serverMods = filterModsByEnvironment(distribution.mods, 'server');
  console.log(`[sync-server] Mods esperados en servidor: ${serverMods.length} (both + server_only)`);
  console.log(`[sync-server] Carpeta destino: ${modsDir}`);

  await syncModsFolder(serverMods, modsDir, (msg) => console.log(`[sync-server] ${msg}`));

  console.log('[sync-server] Sincronizacion completada. mods/ del servidor Arclight actualizada.');
}

main().catch((err) => {
  console.error('[sync-server] ERROR:', err.message);
  process.exit(1);
});
