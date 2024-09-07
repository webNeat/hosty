import { AnyTask } from './ansible/types.js'

export function add_condition(task: AnyTask, condition: string): AnyTask {
  if (task.when) task.when = `(${condition}) and (${task.when})`
  else task.when = condition
  return task
}
