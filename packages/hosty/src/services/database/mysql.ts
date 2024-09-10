import { container } from '../container.js'
import { MySQL, MySQLConfig, Server } from '../../types.js'

export function mysql(config: MySQLConfig): MySQL {
  return {
    ...config,
    type: 'db.mysql',
    host: config.name,
    port: 3306,
    get_deploy_tasks: (server) => get_deploy_tasks(server, config),
    get_destroy_tasks: (server) => get_destroy_tasks(server, config),
  }
}

function get_deploy_tasks(server: Server, config: MySQLConfig) {
  const compose = config.compose || {}
  if (!compose.image) {
    compose.image = `mysql`
    if (config.version) compose.image += ':' + config.version
  }
  compose.environment = {
    MYSQL_ROOT_PASSWORD: config.root_password,
    MYSQL_DATABASE: config.name,
    MYSQL_USER: config.user,
    MYSQL_PASSWORD: config.pass,
    ...(compose.environment || {}),
  }
  compose.expose ||= []
  compose.expose.push('3306')
  if (config.exposed_port) {
    compose.ports ||= []
    compose.ports.push(`${config.exposed_port}:3306`)
  }

  const files: Record<string, string> = {}
  if (config.config) {
    files['custom.cnf'] = config.config
    compose.volumes ||= []
    compose.volumes.push('./custom.cnf:/etc/mysql/conf.d/custom.cnf:ro')
  }

  const tasks = container({ name: config.name, compose, files }).get_deploy_tasks(server)
  return tasks
}

function get_destroy_tasks(server: Server, config: MySQLConfig) {
  const compose = config.compose || {}
  const tasks = container({ name: config.name, compose }).get_destroy_tasks(server)
  return tasks
}
