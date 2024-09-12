import os from 'os'
import path from 'path'
import { Host } from './ansible/types.js'
import * as blocks from './blocks/index.js'
import { Server, ServerConfig } from './types.js'

export function server(config: ServerConfig): Server {
  const user = os.userInfo().username
  let connection = config.connection
  if (!connection) {
    if (config.name === 'localhost') connection = { type: 'local', user }
    else connection = { type: 'ssh', address: config.name, user }
  }
  const hosty_dir = config.hosty_dir || '/srv/hosty'
  const backups_dir = path.join(hosty_dir, 'backups')
  const services_dir = path.join(hosty_dir, 'services')
  return {
    connection,
    hosty_dir,
    backups_dir,
    services_dir,
    name: config.name,
    ssh_key: config.ssh_key || { path: '~/.ssh/id_rsa', passphrase: '' },
    git_config: config.git_config || {},
    docker_network: config.docker_network || 'hosty',
    docker_prefix: config.docker_prefix || '',
    get_service_dir: (name) => path.join(services_dir, name),
    get_backups_dir: (name) => path.join(backups_dir, name),
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

export function get_setup_tasks(server: Server) {
  return [
    blocks.install_docker(),
    blocks.install_git(server.git_config),
    blocks.generate_ssh_key(server.ssh_key),
    blocks.install_nixpacks(),
    blocks.create_directory(server.hosty_dir),
    blocks.install_caddy(`${server.services_dir}/*/Caddyfile`),
  ]
}
