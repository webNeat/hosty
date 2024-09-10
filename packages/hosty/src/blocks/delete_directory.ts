import { builtin } from '../ansible/tasks/index.js'

export function delete_directory(path: string) {
  return builtin.file(`Delete directory ${path}`, { path, state: 'absent' }, { become: true })
}
