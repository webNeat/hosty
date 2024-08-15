import { block } from './block.js'
import { builtin } from '../ansible/tasks/index.js'

type Config = {
  domain: string
  caddyfile_path: string
}

export function delete_domain({ domain, caddyfile_path }: Config) {
  return block(`Delete domain ${domain}`, {}, [
    builtin.lineinfile(`Remove ${domain} from /etc/hosts`, { path: '/etc/hosts', line: `127.0.0.1 ${domain}`, state: 'absent' }, { become: true }),
    builtin.file(`Delete Caddyfile for ${domain}`, { path: caddyfile_path, state: 'absent' }, { register: 'caddyfile' }),
    builtin.command(`Reload caddy`, { cmd: `sudo systemctl reload caddy` }, { become: true, when: 'caddyfile.changed' }),
  ]).get()
}
