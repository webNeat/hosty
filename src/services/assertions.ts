import { Tasks } from '../ansible/types.js'
import { Assertions } from '../types.js'

export function assertions(...tasks: Tasks): Assertions {
  return { type: 'assertions', get_deploy_tasks: () => tasks, get_destroy_tasks: () => [] }
}
