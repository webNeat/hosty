import { Block } from '../ansible/types.js'
import { builtin } from '../ansible/tasks/index.js'
import { block } from './block.js'

export function install_caddy(caddyfiles_pattern: string): Block {
  return block(`Install Caddy`, {}, [
    builtin.apt(
      `Install Caddy's dependencies`,
      { name: ['debian-keyring', 'debian-archive-keyring', 'apt-transport-https', 'curl'], state: 'present' },
      { become: true },
    ),
    builtin.shell(
      `Add Caddy's official GPG key`,
      {
        cmd: `curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --batch --yes --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg`,
      },
      { become: true },
    ),
    builtin.shell(
      `Add Caddy's apt repository`,
      {
        cmd: `curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list`,
        creates: `/etc/apt/sources.list.d/caddy-stable.list`,
      },
      { become: true },
    ),
    builtin.apt(`Update apt cache`, { update_cache: true }, { become: true }),
    builtin.apt(`Install Caddy`, { name: 'caddy', state: 'present' }, { become: true }),
    builtin.copy(
      `Configure Caddy`,
      {
        dest: '/etc/caddy/Caddyfile',
        content: `import ${caddyfiles_pattern}\n`,
      },
      { become: true },
    ),
    builtin.command(`Reload Caddy config`, { cmd: `sudo systemctl start caddy` }, { become: true }),
  ]).get()
}
