$ErrorActionPreference = 'Stop'
$projectRoot = Split-Path (Split-Path $PSScriptRoot -Parent) -Parent
Set-Location -LiteralPath $projectRoot
# Ejecutar desde PowerShell de Windows permite comparar con el entorno de Codex.
# Instancia aislada, 8 GiB, shaders desactivados, sin cuenta ni conexión al servidor.
& java vortex/tools/LoopbackProbe.java
if ($LASTEXITCODE -ne 0) { throw 'La prueba Java de conexiones locales sigue fallando; se conserva el pack.' }
$env:VORTEX_PROBE_PACK = '1'
Remove-Item Env:VORTEX_PROBE_IPV4 -ErrorAction SilentlyContinue
& '.stage2-downloads/node22/node.exe' vortex/tools/smoke-minimal.cjs
exit $LASTEXITCODE
