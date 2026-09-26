# Vortex Launcher

Launcher personalizado de Minecraft (Electron) con sincronizacion centralizada via un `distribution.json` remoto en GitHub. Emula el modelo Tortillaland: el admin sube un cambio al repo del modpack y clientes + servidor se sincronizan solos.

## Entorno de juego

- Minecraft `1.21.1`
- Cliente: NeoForge `21.1.65` (ajustar en `src/shared/constants.js` y `distribution.json` a la ultima estable)
- Servidor: Arclight `1.21.1` (NeoForge + plugins)

## Estructura

```
src/
  main/        proceso principal Electron (ventana, IPC, sync, launch, updater)
  renderer/    interfaz (HTML/CSS/JS)
  shared/      logica compartida cliente/servidor (fetch, hash, descarga)
server/
  sync-server.js   script standalone para el servidor Arclight
distribution.json  plantilla del manifiesto remoto (subir esto al repo del modpack)
```

## Configuracion antes de compilar

Editar `src/shared/constants.js`:

- `DISTRIBUTION_URL`: URL raw del `distribution.json` (repo del modpack, no el del launcher).
- `GITHUB_OWNER` / `GITHUB_REPO` / `RELEASES_API_URL`: repo donde se publican los releases del propio launcher.

Editar `package.json` -> `build.publish.owner`/`repo` igual que arriba.

## Instalacion y desarrollo

```bash
npm install
npm run dev
```

## Compilar el launcher (ejecutable distribuible)

```bash
npm run build:win
npm run build:linux
npm run build:mac
```

Los binarios quedan en `dist/`. Subirlos como assets de un GitHub Release con tag `vX.Y.Z`; el launcher detecta releases nuevos via `/releases/latest` y se auto-actualiza.

## Publicar un cambio de modpack (flujo del admin)

1. Editar `distribution.json` en el repo del modpack (subir mod nuevo, cambiar version, actualizar configs).
2. Incrementar el campo `"version"`.
3. Hacer commit/push a `main`.
4. Todos los clientes detectan la nueva version al pulsar "Jugar" y se sincronizan solos.
5. Ejecutar `sync-server.js` en el servidor Arclight para aplicar el mismo cambio a `mods/`.

## Ejecutar la sincronizacion en el servidor Arclight

```bash
cd server
node sync-server.js --distribution-url=https://raw.githubusercontent.com/usuario/modpack/main/distribution.json --mods-dir=/ruta/al/servidor/mods
```

Ejecutar antes de cada arranque del servidor (manual, cron, o hook del panel de hosting).

## Esquema de `distribution.json`

- `version`: version del modpack.
- `minecraft_version`: `"1.21.1"`.
- `loader.type` / `loader.version`: `"neoforge"` / version de NeoForge.
- `mods[]`: `{ name, url, sha1, environment }` donde `environment` es `both` | `client_only` | `server_only`.
- `configs[]`: `{ path, url, sha1 }`, `path` relativo a la carpeta `config/` del cliente.

### Clasificacion de mods

| environment    | Cliente descarga | Servidor descarga |
|-----------------|:---:|:---:|
| `client_only`   | Si  | No  |
| `server_only`   | No  | Si  |
| `both`          | Si  | Si  |

Los plugins de Spigot no se gestionan aqui: `sync-server.js` solo administra la carpeta `mods/` de Arclight.
