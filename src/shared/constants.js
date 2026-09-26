// Configuracion central del ecosistema Vortex Launcher.
// Ajustar estas URLs al repositorio real de GitHub del administrador.

module.exports = {
  // URL raw del distribution.json (GitHub raw o GitHub Pages)
  DISTRIBUTION_URL: 'https://raw.githubusercontent.com/FrankloIA/vortex-launcher/main/distribution.json',

  // Repo del propio ejecutable del launcher (para auto-actualizacion)
  GITHUB_OWNER: 'FrankloIA',
  GITHUB_REPO: 'vortex-launcher',
  RELEASES_API_URL: 'https://api.github.com/repos/FrankloIA/vortex-launcher/releases/latest',

  MINECRAFT_VERSION: '1.21.1',
  NEOFORGE_VERSION: '21.1.65',

  LOCAL_CONFIG_FILE: 'local_config.json',

  ENV_BOTH: 'both',
  ENV_CLIENT_ONLY: 'client_only',
  ENV_SERVER_ONLY: 'server_only'
};
