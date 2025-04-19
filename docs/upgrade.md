# Upgrade Guide: Migrating to Container-based Caddy

This guide walks you through migrating from system-level Caddy to the Docker-based Caddy setup.

## 1. Copy system Caddy config

Before uninstalling, copy your existing Caddy config into the Hosty directory:

```bash
sudo mkdir -p /srv/hosty/caddy/config /srv/hosty/caddy/includes /srv/hosty/caddy/logs
sudo cp /etc/caddy/Caddyfile /srv/hosty/caddy/config/
sudo cp -r /etc/caddy/certs /srv/hosty/caddy/config/
sudo cp /etc/caddy/includes/*.Caddyfile /srv/hosty/caddy/includes/
```

## 2. Stop and Remove System Caddy

Run:

```bash
sudo systemctl stop caddy
sudo apt remove --purge caddy
```

Remove residual files:

```bash
sudo rm -rf /etc/caddy /var/log/caddy
```

This stops and uninstalls the legacy system‑level Caddy package.

## 3. Update DNS or /etc/hosts

Ensure your domains point to the host machine:

```bash
# Example for a local test domain
echo "127.0.0.1 example.local" | sudo tee -a /etc/hosts
```

## 4. Deploy Container-based Caddy

Re-run your Hosty script:

```bash
deploy(vps, /* your services */)
run({ ask_sudo_pass: true })
```

This will start the Caddy Docker container, load your existing config, and serve your sites with Docker-managed TLS.

## 5. Automate Migration with Hosty

You can automate the migration via Hosty's `tasks` helper:

```ts
import path from 'path'
import { server, tasks, deploy, run, blocks, ansible } from 'hosty'
const { builtin } = ansible.tasks

const vps = server({ name: 'your-server-ip-or-hostname' })
const caddy_dir = path.join(vps.hosty_dir, 'caddy')
deploy(
  vps,
  tasks(
    blocks.create_directory(caddy_dir),
    blocks.create_directory(path.join(caddy_dir, 'config')),
    blocks.create_directory(path.join(caddy_dir, 'includes')),
    blocks.create_directory(path.join(caddy_dir, 'logs')),
    builtin.copy('Copy Caddyfile', { src: '/etc/caddy/Caddyfile', dest: path.join(caddy_dir, 'config/Caddyfile') }),
    builtin.copy('Copy certificates', { src: '/etc/caddy/certs', dest: path.join(caddy_dir, 'config/certs'), recursive: true }),
    builtin.copy('Copy includes', { src: '/etc/caddy/includes', dest: path.join(caddy_dir, 'includes'), recursive: true }),
    builtin.command('Stop and remove system Caddy', { cmd: 'sudo systemctl stop caddy && sudo apt remove --purge caddy' }, { become: true }),
    blocks.delete_directory(path.join(caddy_dir, 'config')),
    blocks.delete_directory(path.join(caddy_dir, 'includes')),
    blocks.delete_directory(path.join(caddy_dir, 'logs')),
  )
)
run({ ask_sudo_pass: true })
```

That's it! Your migration is fully automated and your setup is containerized under Hosty.
