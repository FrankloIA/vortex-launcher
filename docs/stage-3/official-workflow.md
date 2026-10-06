# Publicación del pack Vortex

El launcher Windows 1.0.2 incorpora el canal de packs firmado de GitHub. Los clientes anteriores necesitan instalarlo para recibir las nuevas publicaciones del pack. El número del ejecutable y el del pack son independientes.

1. Prepara los cambios en la versión activa. Las notas automáticas registran añadidos, sustituciones, retiradas y cambios de configuración. Los commits del launcher posteriores al inicio del borrador también se incorporan.
2. Publica la revisión en pruebas y abre «Probar versión». Se utiliza Mystwer, con datos y sesión del launcher separados.
3. Inicia el cliente, juega al menos un minuto y ciérralo normalmente. Cierra también el launcher de pruebas antes de confirmar el resultado. Los errores de preparación, cierres anormales, informes de crash y fallos del launcher bloquean la prueba. Esta comprobación no garantiza que se hayan probado todas las situaciones posibles.
4. Confirma «La partida funcionó correctamente» si la comprobación automática terminó bien y no observaste problemas. Si hay problemas, utiliza «Encontré problemas».
5. «Publicar oficialmente» sube los archivos exactos a GitHub Releases y actualiza el canal firmado únicamente después de completar la subida. Se requiere una sesión de GitHub CLI con permiso de escritura en `FrankloIA/vortex-launcher`.

Cambiar archivos, notas, la revisión publicada o el código del launcher invalida la prueba. Las publicaciones oficiales quedan bloqueadas incluso cuando hay otra versión oficial más reciente. Para modificar una publicación se crea una nueva versión o un Fix.

Los paquetes se dividen en archivos de hasta 256 MiB y se verifican con SHA-256. El cliente comprueba la firma Ed25519 usando la clave pública incluida en `helios/vortex/pack-feed.json`. No se distribuyen claves privadas ni cuentas. No se sustituyen archivos por descargas originales de CurseForge o Modrinth.

Al iniciar sesión y cada diez minutos, el launcher comprueba el canal oficial. También lo comprueba antes de iniciar el perfil oficial. La instalación conserva mundos y preferencias, y actualiza configuraciones predeterminadas que el jugador no haya modificado. Una descarga corrupta o incompleta no se aplica. Si falla la aplicación de archivos, se recupera la versión anterior.

No elimines ni regeneres la clave privada de firma de `.runtime/pack-admin`: cambiarla requiere distribuir previamente otra clave de confianza a los jugadores.
