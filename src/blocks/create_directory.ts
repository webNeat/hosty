import { builtin } from '../ansible/tasks/index.js'

type Config = {
  owner?: string
  group?: string
  mode?: string
}

export function create_directory(path: string, config: Config = {}) {
  config.owner ||= '{{ansible_user}}'
  config.group ||= '{{ansible_user}}'
  config.mode ||= '0755'
  return builtin.file(`Create directory ${path}`, { path, state: 'directory', ...config }, { become: true })
}
