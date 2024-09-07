import path from 'path'
import * as YAML from 'yaml'
import { Block } from '../ansible/types.js'
import { builtin } from '../ansible/tasks/index.js'
import { ComposeFile, Service as ComposeService } from '../compose.types.js'
import { block } from './block.js'
import { create_directory } from './create_directory.js'

type Config = {
  name: string
  service_dir: string
  files_dir?: string
  files?: Record<string, string>
  docker_network: string
  compose: ComposeService | ComposeService[]
  restart_conditions?: string[]
  before_start?: string[]
}

export function create_service({ name, service_dir, docker_network, compose, files_dir, files, restart_conditions, before_start }: Config): Block {
  restart_conditions ||= []
  const x = block(`Create service: ${name}`)

  x.add(create_directory(service_dir))

  if (files_dir) {
    files_dir = path.resolve(files_dir)
    x.add(builtin.copy(`Copy service files for ${name}`, { src: '{{item}}', dest: service_dir }, { register: 'files', with_fileglob: `${files_dir}/*` }))
    restart_conditions.push('files.changed')
  }
  if (files) {
    for (const filename of Object.keys(files)) {
      const var_name = 'additional_file_' + filename.replace(/[^a-zA-Z0-9]/g, '_')
      const destfile = path.join(service_dir, filename)
      x.add(
        create_directory(path.dirname(destfile)),
        builtin.copy(`Create service file ${filename}`, { content: files[filename], dest: destfile }, { register: var_name }),
      )
      restart_conditions.push(var_name + '.changed')
    }
  }

  x.add(
    builtin.copy(
      `Create compose.yaml for ${name}`,
      { content: YAML.stringify(get_compose_file({ name, compose, docker_network })), dest: path.join(service_dir, 'compose.yaml') },
      { register: 'compose' },
    ),
  )
  restart_conditions.push('compose.changed')

  x.add(
    builtin.command(
      `Check if docker network exists`,
      { cmd: `docker network inspect ${docker_network}` },
      { register: 'docker_network_check', ignore_errors: true },
    ),
    builtin.command(`Create docker network`, { cmd: `docker network create ${docker_network}` }, { when: 'docker_network_check.rc != 0', become: true }),
  )

  x.add(
    builtin.command(
      `Check if service ${name} is running`,
      { cmd: `docker inspect --format='{{"{{"}}.State.Running{{"}}"}}' ${name}` },
      { register: 'container_running', ignore_errors: true, become: true },
    ),
  )
  restart_conditions.push('container_running.stdout != "true"')

  const restart_condition = restart_conditions.join(' or ')

  const container_name = `${name}-1`
  if (before_start) {
    for (const cmd of before_start) {
      x.add(
        builtin.command(
          `Run command before start: ${cmd}`,
          { chdir: service_dir, cmd: `docker compose run --rm ${container_name} ${cmd}` },
          { become: true, when: restart_condition },
        ),
      )
    }
  }

  x.add(
    builtin.command(
      `Start service ${name}`,
      { chdir: service_dir, cmd: `docker compose up -d --force-recreate --remove-orphans` },
      { become: true, when: restart_condition },
    ),
  )

  return x.get()
}

function get_compose_file({ name, compose, docker_network }: Pick<Config, 'name' | 'compose' | 'docker_network'>): ComposeFile {
  const networks = {
    [docker_network]: { external: true },
  }
  const services: ComposeFile['services'] = {}
  if (!Array.isArray(compose)) {
    services[name] = {
      container_name: name,
      networks: [docker_network],
      restart: 'unless-stopped',
      ...compose,
    }
  } else {
    let instance = 1
    for (const service of compose) {
      const container_name = `${name}-${instance}`
      services[container_name] = {
        container_name,
        networks: [docker_network],
        restart: 'unless-stopped',
        ...service,
      }
      instance++
    }
  }
  return { services, networks }
}
