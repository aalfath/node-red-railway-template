# Node-RED on Railway

Files behind the Railway "Node-RED" template: the official [`nodered/node-red`](https://hub.docker.com/r/nodered/node-red) image (5.0.9, pinned by digest) with a `settings.js` that turns on the editor login from variables. Node-RED refuses to start if no password is set.

## How the template runs it

- **Image:** `nodered/node-red:5.0.9@sha256:2ccd38b4066648bd5e17430c50a2f8102c566a82fd4f2fc5c342e61664d6896f`
- **Volume:** `/data` (flows, encrypted credentials, installed nodes, and a cached copy of `settings.js`)
- **Health check:** `/`
- **Start command:** downloads `settings.js` from this repo at a fixed commit, caches it in `/data/.railway/` (reused if GitHub can't be reached), then starts Node-RED with it:

```
/bin/sh -c 'mkdir -p /data/.railway && node -e "const f=\"/data/.railway/settings.js\",fs=require(\"fs\");fetch(\"https://raw.githubusercontent.com/aalfath/node-red-railway-template/1d9e3fd954286736fa94d4a994c760537887af27/settings.js\").then(r=>{if(!r.ok)throw Error(\"HTTP \"+r.status);return r.text()}).then(t=>fs.writeFileSync(f,t)).catch(e=>{console.error(\"[railway] settings.js download failed: \"+e.message);if(!fs.existsSync(f))process.exit(1);console.error(\"[railway] using the cached copy\")})" && exec node $NODE_OPTIONS node_modules/node-red/red.js --userDir /data --settings /data/.railway/settings.js'
```

| Variable | Template value | Purpose |
|---|---|---|
| `NODE_RED_ADMIN_USER` | `admin` | Editor login name |
| `NODE_RED_ADMIN_PASSWORD` | `${{secret(24)}}` | Editor password. Plain text (hashed with bcrypt at start-up) or a bcrypt hash (`$2b$…`) |
| `NODE_RED_CREDENTIAL_SECRET` | `${{secret(32)}}` | Encrypts the credentials saved in `flows_cred.json`. Don't change it after the first deploy |
| `PORT` | `1880` | HTTP port; the public domain points to it |
| `RAILWAY_RUN_UID` | `0` | Runs as root: Railway mounts volumes as root, and the image's `node-red` user (uid 1000) can't write to them |

## Building it yourself instead

The `Dockerfile` here bakes `settings.js` into the same pinned image and runs as root, so it needs no start command and no `RAILWAY_RUN_UID`. Deploy the repo as a Railway service, set the variables above (except `RAILWAY_RUN_UID`) and mount a volume at `/data`.

## Updating

Change the image tag and digest together (in the template and in the `Dockerfile`). If you change `settings.js`, update the commit in the start command.
