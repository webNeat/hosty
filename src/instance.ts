import path from 'path'
import YAML from 'yaml'
import { spawn } from 'child_process'
import { mkdir, writeFile } from 'fs/promises'
import * as ansible from './ansible/index.js'
import { get_setup_roles, server_to_host } from './server.js'
import { HostyInstance, RunOptions, Server, Service } from './types.js'

type Deployment = { server: Server; services: Service[] }
type State = {
  servers: Record<string, Server>
  deployments: Deployment[]
}

const defaultRunOptions: RunOptions = {
  ask_sudo_pass: true,
  playbookPath: 'hosty-playbook.yaml',
  spawn_options: {
    stdio: 'inherit',
  },
}

export function instance(): HostyInstance {
  const state: State = {
    servers: {},
    deployments: [],
  }

  const deploy = (server: Server, services: Service[]) => {
    state.servers[server.name] = server
    state.deployments.push({ server, services })
  }

  const playbook = () => {
    const steps: ansible.Playbook = []
    setup_servers(Object.values(state.servers), steps)
    add_deployments(state.deployments, steps)
    return steps
  }

  const write = async (playbookPath: string) => {
    await mkdir(path.dirname(playbookPath), { recursive: true })
    await writeFile(playbookPath, YAML.stringify(playbook()))
  }

  const run = async (userOptions: Partial<RunOptions> = {}) => {
    const options = { ...defaultRunOptions, ...userOptions }
    await write(options.playbookPath)
    const args = [options.playbookPath]
    if (options.ask_sudo_pass) args.push('-K')
    return spawn('ansible-playbook', args, options.spawn_options)
  }

  return { deploy, playbook, write, run }
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
    for (const role of get_setup_roles(server)) {
      steps.push({ hosts: server.name, gather_facts: false, ...role })
    }
  }
}

function add_deployments(deployments: Deployment[], steps: ansible.Step[]) {
  for (const { server, services } of deployments) {
    for (const service of services) {
      for (const role of service.get_roles(server)) {
        steps.push({ hosts: server.name, gather_facts: false, ...role })
      }
    }
  }
}
