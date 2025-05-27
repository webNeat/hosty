import { dirname } from 'path'
import { Block } from '../ansible/types.js'
import { builtin, crypto } from '../ansible/tasks/index.js'
import { block } from './block.js'

type Config = {
  path: string
  passphrase?: string
}

export function generate_ssh_key({ path, passphrase }: Config): Block {
  return block(`Generate ssh key at ${path}`, {}, [
    builtin.stat('Check if SSH key exists', { path }, { register: 'ssh_key' }),
    builtin.file(
      'Ensure .ssh directory exists',
      { path: dirname(path), state: 'directory', owner: '{{ansible_user}}', mode: '0700' },
      { when: 'not ssh_key.stat.exists', become: true },
    ),
    crypto.ssh_key('Generate SSH key', { type: 'rsa', path, passphrase }, { when: 'not ssh_key.stat.exists', become: true }),
  ]).get()
}
