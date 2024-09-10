import { container } from '../container.js'
import { Redis, RedisConfig, Server } from '../../types.js'

export function redis(config: RedisConfig): Redis {
  return {
    ...config,
    type: 'db.redis',
    host: config.name,
    port: 6379,
    get_deploy_tasks: (server) => get_deploy_tasks(server, config),
    get_destroy_tasks: (server) => get_destroy_tasks(server, config),
  }
}

function get_deploy_tasks(server: Server, config: RedisConfig) {
  const compose = config.compose || {}
  if (!compose.image) {
    compose.image = `redis`
    if (config.version) compose.image += ':' + config.version
  }
  if (config.exposed_port) {
    compose.ports ||= []
    compose.ports.push(`${config.exposed_port}:6379`)
  }

  const files: Record<string, string> = {}
  if (config.config) {
    files['redis.conf'] = config.config
    compose.volumes ||= []
    compose.volumes.push('./redis.conf:/usr/local/etc/redis/redis.conf')
  }

  const tasks = container({ name: config.name, compose, files }).get_deploy_tasks(server)
  return tasks
}

function get_destroy_tasks(server: Server, config: RedisConfig) {
  const compose = config.compose || {}
  const tasks = container({ name: config.name, compose }).get_destroy_tasks(server)
  return tasks
}
