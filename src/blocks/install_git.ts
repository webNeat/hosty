import { Block } from '../ansible/types.js'
import { builtin, general } from '../ansible/tasks/index.js'
import { block } from './block.js'

type Config = {
  name?: string
  email?: string
}

export function install_git({ name, email }: Config): Block {
  const x = block(`Install and configure Git`)
  x.add(builtin.apt('Install git', { name: 'git', state: 'present', update_cache: true, cache_valid_time: 3600 }, { become: true }))
  if (name) x.add(general.git_config(`Set git user.name to ${name} globally`, { name: 'user.name', value: name, scope: 'global' }))
  if (email) x.add(general.git_config(`Set git user.email to ${name} globally`, { name: 'user.email', value: email, scope: 'global' }))
  return x.get()
}
