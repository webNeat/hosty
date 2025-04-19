import path from 'path'
import { get_file } from '../files.js'
import * as blocks from '../blocks/index.js'
import { builtin } from '../ansible/tasks/index.js'
import { CaddyConfig, ReverseProxy, ReverseProxyConfig, Server } from '../types.js'

const default_config: Required<CaddyConfig> = {
  get_server_caddyfile: (server) =>
    get_file('server_caddyfile', {
      log_path: path.join(server.hosty_dir, 'caddy', 'logs', 'caddy.log'),
      service_caddyfiles_pattern: path.join(server.hosty_dir, 'caddy', 'includes', '*.Caddyfile'),
    }),
  get_service_caddyfile: (server, config) => {
    const local_urls = Array.from({ length: config.instances }, (_, i) => `${config.service_name}-${i + 1}:80`).join(' ')
    return get_file('service_caddyfile', { domain: config.domain, local_urls })
  },
}

export function caddy(config: CaddyConfig = {}): ReverseProxy {
  const normalized_config = { ...default_config, ...config }
  return {
    get_log_path: (server) => path.join(server.hosty_dir, 'caddy', 'logs', 'caddy.log'),
    get_server_tasks: (server) => get_server_tasks(normalized_config, server),
    get_service_tasks: (server, reverse_proxy_config) => get_service_tasks(normalized_config, server, reverse_proxy_config),
  }
}

function get_server_tasks(config: Required<CaddyConfig>, server: Server) {
  return [
    blocks.create_directory(path.join(server.hosty_dir, 'caddy/config')),
    blocks.create_directory(path.join(server.hosty_dir, 'caddy/includes')),
    blocks.create_directory(path.join(server.hosty_dir, 'caddy/logs')),
    builtin.copy('Create dummy Caddy include', { dest: path.join(server.hosty_dir, 'caddy/includes/.dummy.Caddyfile'), content: '' }, { become: true }),
    builtin.copy(
      'Create master Caddyfile',
      { content: 'import includes/*.Caddyfile', dest: path.join(server.hosty_dir, 'caddy/config/Caddyfile') },
      { register: 'caddy_master' },
    ),
    blocks.create_service({
      name: 'caddy',
      service_dir: `${server.hosty_dir}/caddy`,
      docker_network: server.docker_network,
      compose: {
        image: 'caddy:2.9-alpine',
        ports: ['80:80', '443:443'],
        networks: [server.docker_network],
        volumes: [
          `${server.hosty_dir}/caddy/config:/etc/caddy`,
          `${server.hosty_dir}/caddy/includes:/etc/caddy/includes:ro`,
          `${server.hosty_dir}/caddy/logs:/var/log/caddy`,
        ],
      },
    }),
  ]
}

function get_service_tasks(config: Required<CaddyConfig>, server: Server, reverse_proxy_config: ReverseProxyConfig) {
  return [
    blocks.create_caddy_domain({
      domain: reverse_proxy_config.domain,
      caddyfile_path: path.join(server.hosty_dir, `caddy/includes/${reverse_proxy_config.service_name}.Caddyfile`),
      caddyfile_content: config.get_service_caddyfile(server, reverse_proxy_config),
    }),
    builtin.command(
      `Reload Caddy container`,
      { cmd: `docker exec caddy caddy reload --config /etc/caddy/Caddyfile` },
      { become: true, when: 'caddyfile.changed' },
    ),
  ]
}
