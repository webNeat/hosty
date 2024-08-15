import { Block } from '../ansible/types.js'
import { builtin } from '../ansible/tasks/index.js'
import { block } from './block.js'

export function install_docker(): Block {
  return block(`Install Docker`, {}, [
    builtin.command(
      'Check if Docker is installed',
      { cmd: 'docker --version' },
      { register: 'docker_installed', ignore_errors: true, changed_when: false },
    ),
    builtin.command(
      'Download Docker setup script',
      { chdir: '/tmp', cmd: 'wget https://get.docker.com -O get-docker.sh' },
      { when: 'docker_installed is failed' },
    ),
    builtin.command('Make Docker setup script executable', { chdir: '/tmp', cmd: 'chmod +x ./get-docker.sh' }, { when: 'docker_installed is failed' }),
    builtin.command('Install Docker', { chdir: '/tmp', cmd: './get-docker.sh' }, { when: 'docker_installed is failed', become: true }),
    builtin.command('Add user to Docker group', { cmd: `usermod -aG docker {{ansible_user}}` }, { when: 'docker_installed is failed', become: true }),
  ]).get()
}
