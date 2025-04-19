# Implementing Caddy as a Service

## Overview

Right now, Caddy is installed on the server. I would like to use it in a docker container instead.

## Example Usage

```ts
import {server, reverse_proxy, app, database, deploy} from 'hosty'

const vps = server({
  name: 'vps',
  reverse_proxy: reverse_proxy.caddy({
    version: '2.9-alpine', // Optional, default is 2.9-alpine
    config: ``, // Optional, default to some global config
  }),
})

const db = database.postgres({ name: 'db' })
const demo = app.git({
  name: 'demo',
  domain: 'demo.example.com',
})

deploy(vps, db, demo)
```

## Detailed Implementation Plan

1. Compose-based Caddy Service Block
   - Define `CaddyServiceConfig` type to capture `version`, `image`, `ports`, `networks`, `volumes`, and `before_start` commands.
   - In `src/reverse_proxy/caddy.ts#get_server_tasks`, replace the `blocks.install_caddy` block with:
     ```ts
     blocks.create_service({
       name: 'caddy',
       service_dir: `${server.hosty_dir}/caddy`,
       compose: {
         image: `caddy:${config.version || '2.9-alpine'}`,
         ports: ['80:80', '443:443'],
         networks: [server.docker_network],
         volumes: [
           `${server.hosty_dir}/caddy/config:/etc/caddy`,
           `${server.hosty_dir}/caddy/includes:/etc/caddy/includes:ro`,
           `${server.hosty_dir}/caddy/logs:/var/log/caddy`,
         ],
       },
     })
     ```
2. Mounting and Directories
   - Ensure host dirs exist via `blocks.create_directory` in `get_setup_tasks` for:
     - `${server.hosty_dir}/caddy/config`
     - `${server.hosty_dir}/caddy/includes`
     - `${server.hosty_dir}/caddy/logs`
3. Networking
   - Use `server.docker_network` for inter-service routing.
   - Expose ports 80/443 in compose service.
4. Caddyfile Provisioning
   - Generate a master Caddyfile at `${server.hosty_dir}/caddy/config/Caddyfile` containing:
     ```caddyfile
     import includes/*.Caddyfile
     ```
   - In `src/reverse_proxy/caddy.ts#get_service_tasks`, after creating each service's Caddyfile, add a symlink task using `reverse_proxy_config.service_name`:
     ```ts
     blocks.command(
       `Link ${reverse_proxy_config.service_name} Caddyfile`,
       { cmd: `ln -sf ${server.get_service_dir(reverse_proxy_config.service_name)}/Caddyfile ${server.hosty_dir}/caddy/includes/${reverse_proxy_config.service_name}.Caddyfile` },
       { become: true }
     ),
     ```
5. Refactor Code
   - Delete `src/blocks/install_caddy.ts` and remove its imports.
   - Remove creation and references to the global `logs_dir` (no longer needed)
   - Update docs (`README.md`, `about.md`) to reflect container-based Caddy.
6. Migration and Backward Compatibility
   - Detect legacy system-level Caddy and warn users if present.
   - Provide a migration guide in `docs/upgrade.md` detailing:
     - Stopping/destroying old Caddy (`hosty destroy reverse_proxy caddy`).
     - Copying/moving existing Caddyfiles and certs into `caddy/config` and `caddy/includes`.
     - Removing old logs_dir and deprecated tasks.
7. Testing & CI
   - Add `tests/reverse_proxy_caddy_container.test.ts`:
     - `deploy` should start Caddy container, verify via `docker ps`.
     - Perform HTTP(S) requests to confirm routing.
     - `destroy` should stop/remove container and clean files.
   - Update GitHub Action to include new tests in CI pipeline.