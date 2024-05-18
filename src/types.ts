import { Role, Playbook } from './ansible/types.js'
import * as compose from './compose.types.js'
import { ChildProcess, SpawnOptions } from 'child_process'

export type LocalConnection = {
  type: 'local'
  user?: string
  password?: string
}

export type SshConnection = {
  type: 'ssh'
  address: string
  port?: number
  user?: string
  password?: string
  private_key_path?: string
}

export type DockerConnection = {
  type: 'docker'
  container: string
  user?: string
  password?: string
}

export type ServerConfig = {
  name: string
  ssh_key: {
    path: string
    passphrase: string
  }
  git_config: { name: string; email: string }
  hosty_dir?: string
  docker_network?: string
  connection?: LocalConnection | SshConnection | DockerConnection
}

export type Server = Required<ServerConfig>

export type Service = {
  get_roles: (server: Server) => Role[]
}

export type ContainerConfig = {
  name: string
  files_dir?: string
  files?: Record<string, string>
  compose: compose.Service
}
export type Container = Service & ContainerConfig

export type PostgresConfig = {
  version?: string
  name: string
  user: string
  pass: string
  exposed_port?: number
}
export type Postgres = Service &
  PostgresConfig & {
    host: string
  }

export type Assertions = Service

export type RunOptions = {
  playbookPath: string
  ask_sudo_pass: boolean
  spawn_options: Partial<SpawnOptions>
}

export type HostyInstance = {
  deploy: (server: Server, services: Service[]) => void
  playbook: () => Playbook
  write: (playbookPath: string) => Promise<void>
  run: (options: Partial<RunOptions>) => Promise<ChildProcess>
}
