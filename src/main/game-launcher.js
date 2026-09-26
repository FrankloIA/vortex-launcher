const { Client } = require('minecraft-launcher-core');
const path = require('path');

/**
 * Lanza Minecraft con NeoForge usando minecraft-launcher-core.
 * auth: { online: boolean, username, clientToken?, accessToken?, uuid? }
 */
async function launchGame({ distribution, auth, gameRoot, onData, onClose }) {
  const launcher = new Client();

  const neoforgeVersion = distribution.loader.version;
  const minecraftVersion = distribution.minecraft_version;

  const opts = {
    root: gameRoot,
    version: {
      number: minecraftVersion,
      type: 'release'
    },
    forge: path.join(gameRoot, 'neoforge', `neoforge-${minecraftVersion}-${neoforgeVersion}-installer.jar`),
    memory: {
      max: '4G',
      min: '2G'
    },
    authorization: buildAuthorization(auth)
  };

  launcher.on('data', (line) => onData && onData(line.toString()));
  launcher.on('close', (code) => onClose && onClose(code));
  launcher.on('error', (err) => onData && onData(`[ERROR] ${err.message}`));

  await launcher.launch(opts);
}

function buildAuthorization(auth) {
  if (auth && auth.online) {
    // auth debe provenir de un flujo previo de login Microsoft (MSAL) que
    // resuelva access_token, uuid y username antes de llegar aqui.
    return {
      access_token: auth.accessToken,
      client_token: auth.clientToken,
      uuid: auth.uuid,
      name: auth.username,
      user_properties: '{}',
      meta: { type: 'msa' }
    };
  }

  // Modo offline: identidad local sin verificacion Microsoft.
  return {
    access_token: 'offline',
    client_token: auth?.clientToken || 'offline-client-token',
    uuid: auth?.uuid || require('crypto').randomUUID(),
    name: auth?.username || 'Player',
    user_properties: '{}',
    meta: { type: 'offline' }
  };
}

module.exports = { launchGame };
