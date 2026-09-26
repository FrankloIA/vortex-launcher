const fs = require('fs');
const path = require('path');
const { app } = require('electron');
const { LOCAL_CONFIG_FILE } = require('../shared/constants');

function getGameRootDir() {
  const dir = path.join(app.getPath('appData'), 'VortexLauncher', 'minecraft');
  fs.mkdirSync(dir, { recursive: true });
  return dir;
}

function getConfigPath() {
  return path.join(app.getPath('userData'), LOCAL_CONFIG_FILE);
}

function getLocalConfig() {
  const configPath = getConfigPath();
  if (!fs.existsSync(configPath)) {
    return { version: '0.0.0', auth: null };
  }
  try {
    return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
  } catch {
    return { version: '0.0.0', auth: null };
  }
}

function saveLocalConfig(config) {
  fs.writeFileSync(getConfigPath(), JSON.stringify(config, null, 2), 'utf-8');
}

module.exports = { getGameRootDir, getLocalConfig, saveLocalConfig };
