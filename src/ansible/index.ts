import { AnyTask, Host, Playbook, Step, Tasks } from './types.js'

export * from './types.js'
export * as tasks from './tasks/index.js'

export function task(data: AnyTask) {
  return data
}

export function host(data: Host) {
  return data
}

export function step(host: Host, tasks: Tasks): Step {
  return { hosts: host.name, tasks }
}

export function playbook(data: Playbook) {
  return data
}
