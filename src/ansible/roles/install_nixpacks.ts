import { Role } from '../types.js'
import { builtin } from '../tasks/index.js'

export function install_nixpacks(version: string): Role {
  return {
    tasks: [
      builtin.get_url('Download nixpacks installer', {
        url: `https://github.com/railwayapp/nixpacks/releases/download/v${version}/nixpacks-v${version}-amd64.deb`,
        dest: '/tmp/nixpacks.deb',
        mode: '0644',
      }),
      builtin.apt('Install nixpacks', { deb: '/tmp/nixpacks.deb' }, { become: true }),
    ],
    handlers: [],
  }
}
