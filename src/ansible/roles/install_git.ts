import { Role } from '../types.js'
import { builtin, general } from '../tasks/index.js'

export function install_git(name: string, email: string): Role {
  return {
    tasks: [
      builtin.apt('Install git', { name: 'git', state: 'present', update_cache: true, cache_valid_time: 3600 }, { become: true }),
      general.git_config(`Set git user.name to ${name} globally`, { name: 'user.name', value: name, scope: 'global' }),
      general.git_config(`Set git user.email to ${name} globally`, { name: 'user.email', value: email, scope: 'global' }),
    ],
    handlers: [],
  }
}
