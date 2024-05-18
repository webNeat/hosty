import path from 'path'
import * as yaml from 'yaml'
import { Role } from '../ansible/types.js'
import { roles } from '../ansible/index.js'
import { ComposeFile } from '../compose.types.js'
import { Container, ContainerConfig, Server } from '../types.js'

export function container(config: ContainerConfig): Container {
  return { ...config, get_roles: (server) => get_roles(server, config) }
}

function get_roles(server: Server, { name, compose, files_dir }: ContainerConfig): Role[] {
  const composeFile: ComposeFile = {
    services: {
      [name]: {
        container_name: name,
        networks: [server.docker_network],
        restart: 'unless-stopped',
        ...compose,
      },
    },
    networks: {
      [server.docker_network]: {
        external: true,
      },
    },
  }
  return [
    roles.create_service({
      name,
      files_dir,
      service_dir: path.join(server.hosty_dir, '/services', name),
      docker_network: server.docker_network,
      docker_compose: yaml.stringify(composeFile),
    }),
  ]
}
