import path from 'path'
import { Tasks } from '../../ansible/types.js'
import * as blocks from '../../blocks/index.js'
import { GitApp, GitAppConfig, Server } from '../../types.js'

export function git(config: GitAppConfig): GitApp {
  return {
    ...config,
    type: 'app.git',
    get_deploy_tasks: (server) => get_deploy_tasks(server, config),
    get_destroy_tasks: (server) => get_destroy_tasks(server, config),
  }
}

function get_deploy_tasks(server: Server, config: GitAppConfig): Tasks {
  config.path ||= '.'
  config.instances ||= 1
  const tasks: Tasks = []
  const service_dir = path.join(server.hosty_dir, 'services', config.name)

  if (config.domain) {
    tasks.push(blocks.set_available_ports(service_dir, config.instances, 'app_ports'))
  }

  tasks.push(
    blocks.build_repo({
      repo_url: config.repo,
      branch: config.branch,
      service_dir,
      image_name: config.name,
      facts: { source_changed: 'source_changed' },
      path: config.path,
      env: config.env,
    }),
  )

  const service = blocks.create_service({
    name: config.name,
    compose: make_composes(config),
    docker_network: server.docker_network,
    service_dir,
    restart_conditions: ['source_changed'],
    before_start: config.before_start,
  })
  tasks.push(service)

  if (config.domain) {
    tasks.push(blocks.create_domain({ domain: config.domain, ports_var: 'app_ports', caddyfile_path: path.join(service_dir, 'Caddyfile') }))
  }
  return tasks
}

function get_destroy_tasks(server: Server, config: GitAppConfig): Tasks {
  const tasks: Tasks = []
  const service_dir = path.join(server.hosty_dir, 'services', config.name)
  tasks.push(blocks.delete_service(service_dir))
  tasks.push(blocks.delete_docker_image(config.name))
  if (config.domain) {
    tasks.push(blocks.delete_domain({ domain: config.domain, caddyfile_path: path.join(service_dir, 'Caddyfile') }))
  }
  return tasks
}

function make_composes(config: GitAppConfig) {
  const compose = config.compose || {}
  compose.image = config.name
  compose.environment = { ...(config.env || {}), ...(compose.environment || {}) }
  compose.ports ||= []

  const composes = []
  for (let i = 1; i <= config.instances!; i++) {
    composes.push({
      ...compose,
      ports: [...compose.ports, `{{app_ports[${i - 1}]}}:80`],
    })
  }
  return composes
}
