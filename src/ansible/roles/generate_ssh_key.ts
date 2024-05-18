import { Role } from '../types.js'
import { builtin, crypto } from '../tasks/index.js'

export function generate_ssh_key(path: string, passphrase: string): Role {
  return {
    tasks: [
      builtin.file(
        'Ensure .ssh directory exists',
        { path: '/home/{{ansible_user}}/.ssh', state: 'directory', owner: '{{ ansible_user }}', mode: '0700' },
        { become: true },
      ),
      crypto.ssh_key('Generate SSH key', { type: 'rsa', path, passphrase }, { become: true }),
    ],
    handlers: [],
  }
}
