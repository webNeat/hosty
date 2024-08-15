import { Tasks } from '../ansible/types.js'
import { builtin } from '../ansible/tasks/index.js'
import { Command, CommandConfig, Server } from '../types.js'

export function command(config: CommandConfig): Command {
  return {
    ...config,
    type: 'command',
    get_deploy_tasks: (server) => get_deploy_tasks(server, config),
    get_destroy_tasks: (server) => get_destroy_tasks(server, config),
  }
}

function get_deploy_tasks(server: Server, config: CommandConfig): Tasks {
  const cmd = get_command_prefix(server, config.service) + config.cmd
  if (config.cron) {
    let attrs: builtin.CronAttrs = { name: config.name, job: cmd }
    if (typeof config.cron === 'string') {
      attrs.special_time = config.cron
    } else {
      attrs = { ...attrs, ...config.cron }
    }
    return [builtin.cron(`Setup cron ${config.name}`, attrs)]
  }
  return [builtin.shell(`Run command ${config.name}`, { cmd, executable: '/bin/bash' })]
}

function get_command_prefix(server: Server, service?: CommandConfig['service']) {
  if (!service) return ''
  const service_dir = server.get_service_dir(service.name)
  let container_name = service.name
  if (service.type === 'app.git') container_name += '-1'
  return `cd ${service_dir} && docker compose run --rm ${container_name} `
}

function get_destroy_tasks(_: Server, config: CommandConfig): Tasks {
  if (!config.cron) return []
  return [
    builtin.cron(`Delete cron ${config.name}`, {
      name: config.name,
      job: config.cmd,
      state: 'absent',
    }),
  ]
}
