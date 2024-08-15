import { instance } from './instance.js'

export * from './types.js'
export * from './services/index.js'
export { server } from './server.js'
export { assert } from './blocks/index.js'
export { instance }

export const { deploy, destroy, playbook, write, run } = instance()
