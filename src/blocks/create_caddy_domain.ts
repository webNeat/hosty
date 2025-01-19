import { builtin } from '../ansible/tasks/index.js'
import { Block } from '../ansible/types.js'
import { block } from './block.js'

type Config = {
  domain: string
  caddyfile_path: string
  caddyfile_content: string
}

export function create_caddy_domain(config: Config): Block {
  return block(`Configure Caddy domain: ${config.domain}`, {}, [
    builtin.lineinfile(
      `Ensure ${config.domain} is in /etc/hosts`,
      { path: '/etc/hosts', line: `127.0.0.1 ${config.domain}`, state: 'present' },
      { become: true },
    ),
    builtin.copy(`Create Caddyfile for ${config.domain}`, { dest: config.caddyfile_path, content: config.caddyfile_content }, { register: 'caddyfile' }),
    builtin.command(`Reload caddy`, { cmd: `sudo systemctl reload caddy` }, { become: true, when: 'caddyfile.changed' }),
  ]).get()
}
