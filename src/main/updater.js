const fetch = require('node-fetch');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { app } = require('electron');
const semver = require('semver');
const { spawn } = require('child_process');

const { RELEASES_API_URL } = require('../shared/constants');
const { downloadFile } = require('../shared/sync-core');

function assetNameForPlatform() {
  const plat = process.platform;
  if (plat === 'win32') return { keyword: '.exe', ext: '.exe' };
  if (plat === 'darwin') return { keyword: '.dmg', ext: '.dmg' };
  return { keyword: '.AppImage', ext: '.AppImage' };
}

/** Consulta GitHub Releases y compara con la version actual del launcher. */
async function checkForLauncherUpdate() {
  const currentVersion = app.getVersion();
  const res = await fetch(RELEASES_API_URL, {
    headers: { 'User-Agent': 'vortex-launcher' }
  });

  if (!res.ok) {
    return { updateAvailable: false, error: `GitHub API HTTP ${res.status}` };
  }

  const release = await res.json();
  const remoteVersion = (release.tag_name || '').replace(/^v/, '');

  if (!remoteVersion || !semver.valid(remoteVersion)) {
    return { updateAvailable: false };
  }

  if (semver.lte(remoteVersion, currentVersion)) {
    return { updateAvailable: false, currentVersion, remoteVersion };
  }

  const { keyword } = assetNameForPlatform();
  const asset = (release.assets || []).find((a) => a.name.includes(keyword));

  if (!asset) {
    return { updateAvailable: false, error: `Sin asset para plataforma ${process.platform} en release ${remoteVersion}` };
  }

  return {
    updateAvailable: true,
    currentVersion,
    remoteVersion,
    downloadUrl: asset.browser_download_url,
    assetName: asset.name
  };
}

/** Descarga el instalador/binario nuevo y lanza su ejecucion, luego cierra el launcher actual. */
async function downloadAndApplyUpdate(releaseInfo, onProgress = () => {}) {
  const tmpDir = path.join(os.tmpdir(), 'vortex-launcher-update');
  fs.mkdirSync(tmpDir, { recursive: true });
  const destPath = path.join(tmpDir, releaseInfo.assetName);

  await downloadFile(releaseInfo.downloadUrl, destPath, (downloaded, total) => {
    onProgress({ downloaded, total });
  });

  if (process.platform === 'win32' || process.platform === 'darwin') {
    // Ejecuta el instalador; el usuario completa la instalacion y relanza la app.
    spawn(destPath, [], { detached: true, stdio: 'ignore' }).unref();
  } else {
    // AppImage: reemplaza el binario actual y reinicia.
    const currentExe = process.env.APPIMAGE || app.getPath('exe');
    fs.copyFileSync(destPath, currentExe);
    fs.chmodSync(currentExe, 0o755);
    spawn(currentExe, [], { detached: true, stdio: 'ignore' }).unref();
  }

  app.quit();
  return { applied: true };
}

module.exports = { checkForLauncherUpdate, downloadAndApplyUpdate };
