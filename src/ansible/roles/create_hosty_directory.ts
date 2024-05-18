import { Role } from '../types.js'
import { builtin } from '../tasks/index.js'

export function create_hosty_directory(path: string): Role {
  return {
    tasks: [
      builtin.file(
        'Create hosty directory',
        { path, state: 'directory', mode: '0755', owner: '{{ansible_user}}', group: '{{ansible_user}}' },
        { become: true },
      ),
    ],
    handlers: [],
  }
}
