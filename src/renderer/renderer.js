const playButton = document.getElementById('play-button');
const statusBadge = document.getElementById('status-badge');
const statusMessage = document.getElementById('status-message');
const progressFill = document.getElementById('progress-fill');
const logOutput = document.getElementById('log-output');
const usernameInput = document.getElementById('username-input');

function appendLog(line) {
  logOutput.textContent += line + '\n';
  logOutput.scrollTop = logOutput.scrollHeight;
}

function setStatus(phase, message) {
  statusBadge.textContent = phase;
  statusMessage.textContent = message;
}

window.vortex.onStatus(({ phase, message }) => {
  setStatus(phase, message);
  if (phase === 'sync-complete' || phase === 'up-to-date') {
    progressFill.style.width = '100%';
  }
});

window.vortex.onLog((line) => appendLog(line));

window.vortex.onClosed((code) => {
  setStatus('Inactivo', `Minecraft cerrado (codigo ${code})`);
  playButton.disabled = false;
});

window.vortex.onUpdateProgress(({ downloaded, total }) => {
  if (total > 0) {
    const pct = Math.round((downloaded / total) * 100);
    setStatus('Actualizando launcher', `Descargando actualizacion... ${pct}%`);
  }
});

playButton.addEventListener('click', async () => {
  playButton.disabled = true;
  logOutput.textContent = '';
  progressFill.style.width = '10%';

  const mode = document.querySelector('input[name="auth-mode"]:checked').value;
  const auth = {
    online: mode === 'online',
    username: usernameInput.value.trim() || 'Player'
  };

  await window.vortex.saveAuth(auth);

  const result = await window.vortex.play(auth);
  if (!result.success) {
    setStatus('Error', result.error);
    playButton.disabled = false;
  }
});

async function checkLauncherUpdate() {
  const info = await window.vortex.checkLauncherUpdate();
  if (info.updateAvailable) {
    setStatus('Actualizacion disponible', `Descargando version ${info.remoteVersion}...`);
    playButton.disabled = true;
    await window.vortex.applyLauncherUpdate(info);
  }
}

(async function init() {
  const local = await window.vortex.getLocalConfig();
  if (local.auth) {
    usernameInput.value = local.auth.username || '';
    document.querySelector(`input[name="auth-mode"][value="${local.auth.online ? 'online' : 'offline'}"]`).checked = true;
  }
  await checkLauncherUpdate();
})();
