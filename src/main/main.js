const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');

const { checkForLauncherUpdate, downloadAndApplyUpdate } = require('./updater');
const { getLocalConfig, saveLocalConfig, getGameRootDir } = require('./local-config');
const { syncClient } = require('./game-sync');
const { launchGame } = require('./game-launcher');
const { DISTRIBUTION_URL } = require('../shared/constants');
const { fetchDistribution } = require('../shared/sync-core');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 650,
    resizable: false,
    icon: path.join(__dirname, '../../assets/icon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

function send(channel, payload) {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send(channel, payload);
  }
}

// --- IPC: chequeo de actualizacion del propio launcher ---
ipcMain.handle('launcher:check-update', async () => {
  return checkForLauncherUpdate();
});

ipcMain.handle('launcher:apply-update', async (_event, releaseInfo) => {
  return downloadAndApplyUpdate(releaseInfo, (progress) => send('launcher:update-progress', progress));
});

// --- IPC: config local del jugador ---
ipcMain.handle('config:get-local', async () => getLocalConfig());
ipcMain.handle('config:get-auth', async () => getLocalConfig().auth || null);
ipcMain.handle('config:save-auth', async (_event, auth) => {
  const cfg = getLocalConfig();
  cfg.auth = auth;
  saveLocalConfig(cfg);
  return cfg;
});

// --- IPC: flujo principal "Jugar" ---
ipcMain.handle('game:play', async (_event, { auth }) => {
  try {
    send('game:status', { phase: 'checking', message: 'Comprobando distribution.json...' });
    const distribution = await fetchDistribution(DISTRIBUTION_URL);

    await syncClient(distribution, (progress) => send('game:status', progress));

    send('game:status', { phase: 'launching', message: 'Iniciando Minecraft...' });
    await launchGame({
      distribution,
      auth,
      gameRoot: getGameRootDir(),
      onData: (line) => send('game:log', line),
      onClose: (code) => send('game:closed', code)
    });

    return { success: true };
  } catch (err) {
    send('game:status', { phase: 'error', message: err.message });
    return { success: false, error: err.message };
  }
});
