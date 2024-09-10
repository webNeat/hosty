import { builtin } from '../ansible/tasks/index.js'

export function delete_docker_image(name: string) {
  return builtin.shell(
    `Delete docker image ${name}`,
    { cmd: `docker rmi $(docker images -q ${name})`, executable: '/bin/bash' },
    { become: true, ignore_errors: true },
  )
}
