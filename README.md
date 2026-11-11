# Node-RED on Railway

A small wrapper around the official [`nodered/node-red`](https://hub.docker.com/r/nodered/node-red) image (5.0.9, pinned by digest) for Railway:

- `settings.js` turns on the editor login from variables, and Node-RED refuses to start if no password is set.
- Runs as root, so it can write to Railway volumes (they're mounted as root and the image's `node-red` user can't write to them).
- Listens on `PORT` (1880 by default). Flows, credentials and installed nodes live in `/data`.

| Variable | Default in the template | Purpose |
|---|---|---|
| `NODE_RED_ADMIN_USER` | `admin` | Editor login name |
| `NODE_RED_ADMIN_PASSWORD` | `${{secret(24)}}` | Editor password. Plain text (hashed with bcrypt at start-up) or a bcrypt hash (`$2b$…`) |
| `NODE_RED_CREDENTIAL_SECRET` | `${{secret(32)}}` | Encrypts the credentials saved in `flows_cred.json`. Don't change it after the first deploy |
| `PORT` | `1880` | HTTP port |

Mount a volume at `/data`. The health check path is `/`.

To update Node-RED, change the tag and the digest in the `Dockerfile` together.
