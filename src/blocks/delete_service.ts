import { block } from './block.js'
import { Block } from '../ansible/types.js'
import { builtin } from '../ansible/tasks/index.js'
import { delete_directory } from './delete_directory.js'

export function delete_service(service_dir: string): Block {
  const x = block(`Delete service at ${service_dir}`)
  x.add(builtin.stat(`Check the service directory`, { path: service_dir }, { register: 'service_dir' }))
  x.add(
    builtin.command(
      `Stop service at ${service_dir}`,
      { chdir: service_dir, cmd: `docker compose down -v` },
      { become: true, when: `service_dir.stat.exists` },
    ),
  )
  x.add(delete_directory(service_dir))
  return x.get()
}
