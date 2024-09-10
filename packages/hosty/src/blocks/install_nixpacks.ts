import { builtin } from '../ansible/tasks/index.js'

export function install_nixpacks() {
  return builtin.shell(
    `Install nixpacks`,
    { cmd: `curl -sSL https://nixpacks.com/install.sh | sudo bash`, creates: `/usr/local/bin/nixpacks` },
    { become: true },
  )
}
