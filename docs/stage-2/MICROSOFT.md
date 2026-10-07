# Configurar Microsoft para Vortex

El launcher utiliza una aplicación propia. El ID público se guarda en `vortex/vortex/microsoft-auth.json`; la variable `VORTEX_MICROSOFT_CLIENT_ID` tiene prioridad. Actualmente el ID está vacío: el inicio de sesión real todavía no se ha probado.

1. Entrar en [Microsoft Entra](https://entra.microsoft.com/) con la cuenta que gestionará Vortex y abrir **Registros de aplicaciones → Nuevo registro**.
2. Usar el nombre **Vortex Launcher** y permitir cuentas Microsoft personales. La guía Vortex recomienda cuentas de cualquier directorio y cuentas personales.
3. En **Autenticación**, añadir la plataforma **Aplicaciones móviles y de escritorio** con la URI exacta `https://login.microsoftonline.com/common/oauth2/nativeclient`.
4. Copiar **Id. de aplicación (cliente)** desde **Información general**. Este UUID es público; no enviar contraseñas, tokens ni valores de secretos al chat. Una aplicación de escritorio es un cliente público; el código de Vortex no utiliza un client secret.
5. Configurar el ID y reiniciar Vortex:

```powershell
Set-Location 'D:\Vortex Launcher'
& '.stage2-downloads/node22/node.exe' vortex/tools/configure-microsoft.cjs 'ID-PUBLICO-DE-LA-APLICACION'
npm start
```

La configuración del ID no garantiza acceso a las API de Minecraft. La [guía oficial del proyecto Vortex](https://github.com/dscalzi/VortexLauncher/blob/master/docs/MicrosoftAuth.md) describe la solicitud de aprobación mediante [el formulario Microsoft](https://aka.ms/mce-reviewappid), después de realizar el intento de acceso inicial. Registrar el resultado real antes de dar por validada la autenticación; no confundir un rechazo de aprobación con un error de contraseña.

Referencia Microsoft: [registro de aplicaciones de escritorio](https://learn.microsoft.com/en-us/entra/identity-platform/scenario-desktop-app-registration) y [configuración del cliente](https://learn.microsoft.com/en-us/entra/identity-platform/msal-client-application-configuration).

Tras configurar y, si corresponde, obtener aprobación: iniciar sesión con una cuenta que tenga Minecraft Java, seleccionar **Vortex — pack completo (prueba local)** y comprobar manualmente el servidor `ly06.astrolnodes.net:25622`. La conexión automática permanece desactivada. La instancia mínima sigue disponible para diagnóstico.

El catálogo completo utiliza la instantánea ya importada en este equipo. Todavía no ofrece descarga o actualización remota del pack; si falta un binario o cambia su hash, el arranque muestra un error en vez de sobrescribir datos del jugador.
