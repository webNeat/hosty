import { CommonTaskAttrs, Task } from '../types.js'

type UfwAttrs = { rule: 'allow' | 'deny'; port: string; proto: 'tcp' | 'udp'; direction: 'in' | 'out' }
export function ufw(name: string, attrs: UfwAttrs, common: CommonTaskAttrs = {}): Task<'community.general.ufw', UfwAttrs> {
  return { name, 'community.general.ufw': attrs, ...common }
}

type GitConfigAttrs = { name: string; value: string; scope: 'global' | 'local' }
export function git_config(name: string, attrs: GitConfigAttrs, common: CommonTaskAttrs = {}): Task<'community.general.git_config', GitConfigAttrs> {
  return { name, 'community.general.git_config': attrs, ...common }
}
