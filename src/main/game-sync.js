const path = require('path');
const { getLocalConfig, saveLocalConfig, getGameRootDir } = require('./local-config');
const { filterModsByEnvironment, syncModsFolder, syncConfigs } = require('../shared/sync-core');

/**
 * Sincroniza la instalacion local del cliente contra el distribution.json remoto.
 * Solo re-sincroniza mods/configs si la version cambio, salvo que se fuerce.
 */
async function syncClient(distribution, onProgress = () => {}) {
  const localConfig = getLocalConfig();
  const gameRoot = getGameRootDir();
  const modsDir = path.join(gameRoot, 'mods');
  const configDir = path.join(gameRoot, 'config');

  const needsUpdate = localConfig.version !== distribution.version;

  if (!needsUpdate) {
    onProgress({ phase: 'up-to-date', message: `Ya estas en la version ${distribution.version}` });
    return { updated: false };
  }

  onProgress({ phase: 'syncing-mods', message: 'Sincronizando mods...' });
  const clientMods = filterModsByEnvironment(distribution.mods, 'client');
  await syncModsFolder(clientMods, modsDir, (msg) => onProgress({ phase: 'syncing-mods', message: msg }));

  onProgress({ phase: 'syncing-configs', message: 'Actualizando configuraciones...' });
  await syncConfigs(distribution.configs, configDir, (msg) => onProgress({ phase: 'syncing-configs', message: msg }));

  localConfig.version = distribution.version;
  saveLocalConfig(localConfig);

  onProgress({ phase: 'sync-complete', message: `Actualizado a la version ${distribution.version}` });
  return { updated: true };
}

module.exports = { syncClient };
