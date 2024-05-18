import { instance } from './instance.js'
import * as ansible from './ansible/index.js'

export * from './types.js'
export * from './services/index.js'
export { server } from './server.js'
export { instance }

export const assert = ansible.roles.assert
export const { deploy, playbook, write, run } = instance()
