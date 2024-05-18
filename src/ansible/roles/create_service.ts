import path from 'path'
import { AnyTask, Role } from '../types.js'
import { builtin } from '../tasks/index.js'

export type ServiceConfig = {
  name: string
  service_dir: string
  files_dir?: string
  docker_network: string
  docker_compose: string
}
export function create_service({ name, service_dir, docker_network, docker_compose, files_dir }: ServiceConfig): Role {
  const tasks: AnyTask[] = []
  const handlers: AnyTask[] = []
  const restart_conditions: string[] = []

  tasks.push(builtin.file(`Create service directory for ${name}`, { path: service_dir, state: 'directory', owner: '{{ansible_user}}' }, { become: true }))

  if (files_dir) {
    tasks.push(
      builtin.copy(`Copy service files for ${name}`, { src: '{{item}}', dest: service_dir }, { register: 'files', with_fileglob: `${files_dir}/*` }),
    )
    restart_conditions.push('files.changed')
  }

  tasks.push(
    builtin.copy(`Create compose.yaml for ${name}`, { content: docker_compose, dest: path.join(service_dir, 'compose.yaml') }, { register: 'compose' }),
  )
  restart_conditions.push('compose.changed')

  // tasks.push(docker.docker_network(`Create docker network`, { name: docker_network, state: 'present' }, { become: true }))
  tasks.push(
    builtin.command(
      `Check if docker network exists`,
      {
        cmd: `docker network inspect ${docker_network}`,
      },
      {
        register: 'docker_network_check',
        ignore_errors: true,
      },
    ),
    builtin.command(
      `Create docker network`,
      {
        cmd: `docker network create ${docker_network}`,
      },
      {
        when: 'docker_network_check.rc != 0',
        become: true,
      },
    ),
  )

  tasks.push(
    builtin.command(
      `Check if service ${name} is running`,
      {
        cmd: `docker inspect --format='{{"{{"}}.State.Running{{"}}"}}' ${name}`,
      },
      { register: 'container_running', ignore_errors: true, become: true },
    ),
  )
  restart_conditions.push('container_running.stdout != "true"')

  tasks.push(
    builtin.command(
      `Start service ${name}`,
      { chdir: service_dir, cmd: `docker compose up -d --force-recreate` },
      { become: true, when: restart_conditions.join(' or ') },
    ),
  )

  return { tasks, handlers }
}
