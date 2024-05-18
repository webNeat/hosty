import { AnyTask, Host, Playbook, Role, Step } from './types.js'

export * from './types.js'
export * as tasks from './tasks/index.js'
export * as roles from './roles/index.js'

export function task(data: AnyTask) {
  return data
}

export function role(data: Role) {
  return data
}

export function host(data: Host) {
  return data
}

export function step(host: Host, role: Role): Step {
  return {
    hosts: host.name,
    tasks: role.tasks,
    handlers: role.handlers,
  }
}

export function playbook(data: Playbook) {
  return data
}
