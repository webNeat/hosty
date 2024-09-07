import { builtin } from '../ansible/tasks/index.js'

export function create_directory(path: string) {
  return builtin.file(
    `Create directory ${path}`,
    { path, state: 'directory', owner: '{{ansible_user}}', group: '{{ansible_user}}', mode: '0755' },
    { become: true },
  )
}
