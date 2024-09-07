import { Tasks } from '../ansible/types.js'
import { TasksService } from '../types.js'

export function assertions(...tasks: Tasks): TasksService {
  return { type: 'tasks', get_deploy_tasks: () => tasks, get_destroy_tasks: () => [] }
}
