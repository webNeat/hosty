import path from 'path'
import { Tasks } from '../ansible/types.js'
import * as blocks from '../blocks/index.js'
import { Container, ContainerConfig, Server } from '../types.js'

export function container(config: ContainerConfig): Container {
  return {
    ...config,
    type: 'container',
    get_deploy_tasks: (server) => get_deploy_tasks(server, config),
    get_destroy_tasks: (server) => get_destroy_tasks(server, config),
  }
}

function get_deploy_tasks(server: Server, { name, compose, files_dir, files }: ContainerConfig): Tasks {
  return [
    blocks.create_service({
      name: server.docker_prefix + name,
      compose,
      files_dir,
      files,
      docker_network: server.docker_network,
      service_dir: path.join(server.hosty_dir, 'services', name),
      restart_conditions: [],
    }),
  ]
}

function get_destroy_tasks(server: Server, { name }: ContainerConfig): Tasks {
  return [blocks.delete_service(path.join(server.hosty_dir, 'services', name))]
}
