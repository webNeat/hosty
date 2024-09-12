import { container } from '../container.js'
import { Postgres, PostgresConfig, Server } from '../../types.js'

export function postgres(config: PostgresConfig): Postgres {
  return {
    ...config,
    type: 'db.postgres',
    host: config.name,
    port: 5432,
    get_deploy_tasks: (server) => get_deploy_tasks(server, config),
    get_destroy_tasks: (server) => get_destroy_tasks(server, config),
  }
}

function get_deploy_tasks(server: Server, config: PostgresConfig) {
  const compose = config.compose || {}
  if (!compose.image) {
    compose.image = `postgres`
    if (config.version) compose.image += ':' + config.version
  }
  compose.environment = {
    POSTGRES_USER: config.user,
    POSTGRES_PASSWORD: config.pass,
    POSTGRES_DB: config.name,
    ...(compose.environment || {}),
  }
  compose.expose ||= []
  compose.expose.push('5432')
  if (config.exposed_port) {
    compose.ports ||= []
    compose.ports.push(`${config.exposed_port}:5432`)
  }
  const files: Record<string, string> = {}
  if (config.config) {
    files['postgresql.conf'] = config.config
    compose.volumes ||= []
    compose.volumes.push('./postgresql.conf:/etc/postgresql/postgresql.conf')
  }
  const tasks = container({ name: config.name, compose, files }).get_deploy_tasks(server)
  return tasks
}

function get_destroy_tasks(server: Server, config: PostgresConfig) {
  const compose = config.compose || {}
  const tasks = container({ name: config.name, compose }).get_destroy_tasks(server)
  return tasks
}
