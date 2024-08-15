import path from 'path'
import YAML from 'yaml'
import { spawn } from 'child_process'
import { mkdir, writeFile } from 'fs/promises'
import * as ansible from './ansible/index.js'
import { get_setup_tasks, server_to_host } from './server.js'
import { HostyInstance, RunOptions, Server, Service } from './types.js'

type Action = { type: 'deploy' | 'destroy'; server: Server; service: Service }
type State = {
  servers: Record<string, Server>
  actions: Action[]
}

const defaultRunOptions: RunOptions = {
  ask_sudo_pass: true,
  playbook_path: 'hosty-playbook.yaml',
  spawn_options: {
    stdio: 'inherit',
  },
  ansible_options: [],
}

export function instance(): HostyInstance {
  const state: State = {
    servers: {},
    actions: [],
  }

  const deploy = (server: Server, ...services: Service[]) => {
    state.servers[server.name] = server
    for (const service of services) {
      state.actions.push({ type: 'deploy', server, service })
    }
  }

  const destroy = (server: Server, ...services: Service[]) => {
    state.servers[server.name] = server
    for (const service of services) {
      state.actions.push({ type: 'destroy', server, service })
    }
  }

  const playbook = () => {
    const steps: ansible.Playbook = []
    setup_servers(Object.values(state.servers), steps)
    for (const action of state.actions) {
      steps.push({ hosts: action.server.name, gather_facts: false, tasks: get_tasks(action) })
    }
    return steps
  }

  const write = async (playbookPath: string) => {
    await mkdir(path.dirname(playbookPath), { recursive: true })
    await writeFile(playbookPath, YAML.stringify(playbook()))
  }

  const run = async (userOptions: Partial<RunOptions> = {}) => {
    const options = { ...defaultRunOptions, ...userOptions }
    await write(options.playbook_path)
    const args = [options.playbook_path]
    if (options.ask_sudo_pass) args.push('-K')
    options.ansible_options.forEach((x) => args.push(x))
    return spawn('ansible-playbook', args, options.spawn_options)
  }

  return { deploy, destroy, playbook, write, run }
}

function setup_servers(servers: Server[], steps: ansible.Step[]) {
  for (const server of servers) {
    const host = server_to_host(server)
    steps.push({
      hosts: 'localhost',
      gather_facts: false,
      tasks: [ansible.tasks.builtin.add_host(`Define server ${server.name}`, host)],
    })
    steps.push({
      hosts: server.name,
      gather_facts: false,
      tasks: [ansible.tasks.builtin.setup(`Gather facts of server ${server.name}`, {})],
    })
    steps.push({ hosts: server.name, gather_facts: false, tasks: get_setup_tasks(server) })
  }
}

function get_tasks({ type, server, service }: Action) {
  if (type === 'deploy') return service.get_deploy_tasks(server)
  if (type === 'destroy') return service.get_destroy_tasks(server)
  return []
}
