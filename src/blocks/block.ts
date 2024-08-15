import { CommonTaskAttrs, Tasks } from '../ansible/types.js'

export function block(name: string, attrs?: CommonTaskAttrs, tasks?: Tasks) {
  const state = { name, ...attrs, block: tasks || [] }
  const add = (...tasks: Tasks) => state.block.push(...tasks)
  const get = () => state
  return { add, get }
}
