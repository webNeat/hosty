import { instance } from './instance.js'
import * as blocks from './blocks/index.js'
import * as ansible from './ansible/index.js'

export * from './types.js'
export * from './services/index.js'
export { server } from './server.js'

export const { deploy, destroy, playbook, write, run } = instance()

export const internals = {ansible, blocks, instance}