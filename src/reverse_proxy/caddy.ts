import path from 'path'
import { get_file } from '../files.js'
import * as blocks from '../blocks/index.js'
import { CaddyConfig, ReverseProxy, ReverseProxyConfig, Server } from '../types.js'

const default_config: Required<CaddyConfig> = {
  get_server_caddyfile: (server) =>
    get_file('server_caddyfile', {
      log_path: `${server.logs_dir}/caddy.log`,
      service_caddyfiles_pattern: `${server.services_dir}/*/Caddyfile`,
    }),
  get_service_caddyfile: (server, config) => get_file('service_caddyfile', config),
}

export function caddy(config: CaddyConfig = {}): ReverseProxy {
  const normalized_config = { ...default_config, ...config }
  return {
    get_log_path: (server) => `${server.logs_dir}/caddy.log`,
    get_server_tasks: (server) => get_server_tasks(normalized_config, server),
    get_service_tasks: (server, reverse_proxy_config) => get_service_tasks(normalized_config, server, reverse_proxy_config),
  }
}

function get_server_tasks(config: Required<CaddyConfig>, server: Server) {
  return [blocks.install_caddy({ caddyfile_content: config.get_server_caddyfile(server) })]
}

function get_service_tasks(config: Required<CaddyConfig>, server: Server, reverse_proxy_config: ReverseProxyConfig) {
  return [
    blocks.create_caddy_domain({
      domain: reverse_proxy_config.domain,
      caddyfile_path: path.join(server.get_service_dir(reverse_proxy_config.service_name), 'Caddyfile'),
      caddyfile_content: config.get_service_caddyfile(server, reverse_proxy_config),
    }),
  ]
}
