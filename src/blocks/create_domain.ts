import { builtin } from '../ansible/tasks/index.js'
import { Block } from '../ansible/types.js'
import { block } from './block.js'

type Config = {
  domain: string
  ports_var: string
  caddyfile_path: string
}

const reverse_proxy = (x: Config) =>
  `${x.domain} {
  reverse_proxy {{ ${x.ports_var} | map('regex_replace', '^', '127.0.0.1:') | join(' ') }} {
    lb_policy client_ip_hash
  }
}`

export function create_domain(config: Config): Block {
  return block(`Configure domain: ${config.domain}`, {}, [
    builtin.lineinfile(
      `Ensure ${config.domain} is in /etc/hosts`,
      { path: '/etc/hosts', line: `127.0.0.1 ${config.domain}`, state: 'present' },
      { become: true },
    ),
    builtin.copy(`Create Caddyfile for ${config.domain}`, { dest: config.caddyfile_path, content: reverse_proxy(config) }, { register: 'caddyfile' }),
    builtin.command(`Reload caddy`, { cmd: `sudo systemctl reload caddy` }, { become: true, when: 'caddyfile.changed' }),
  ]).get()
}
