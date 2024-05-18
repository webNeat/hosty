import { roles } from './ansible/index.js'
import { Host } from './ansible/types.js'
import { Server, ServerConfig } from './types.js'

export function server(config: ServerConfig): Server {
  let connection = config.connection
  if (!connection && config.name === 'localhost') connection = { type: 'local' }
  if (!connection) connection = { type: 'ssh', address: config.name }
  return {
    connection,
    name: config.name,
    ssh_key: config.ssh_key,
    git_config: config.git_config,
    hosty_dir: config.hosty_dir || '/srv/hosty',
    docker_network: config.docker_network || 'hosty',
  }
}

export function server_to_host({ name, connection }: Server): Host {
  const host: Host = { name }
  if (connection?.user) host.ansible_user = connection.user
  if (connection?.password) host.ansible_password = connection.password

  if (connection.type === 'docker') {
    host.ansible_connection = 'docker'
    host.ansible_host = connection.container
  }
  if (connection.type === 'local') {
    host.ansible_connection = 'local'
  }
  if (connection.type === 'ssh') {
    host.ansible_connection = 'ssh'
    host.ansible_host = connection.address || name
    if (connection?.port) host.ansible_port = connection.port
    if (connection?.private_key_path) host.ansible_ssh_private_key_file = connection.private_key_path
  }

  return host
}

export function get_setup_roles(server: Server) {
  return [
    roles.install_docker(),
    roles.install_git(server.git_config.name, server.git_config.email),
    roles.generate_ssh_key(server.ssh_key.path, server.ssh_key.passphrase),
    roles.install_nixpacks('1.24.0'),
  ]
}
