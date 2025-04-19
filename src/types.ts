import { Tasks, Playbook } from './ansible/types.js'
import * as compose from './compose.types.js'
import { ChildProcess, SpawnOptions } from 'child_process'

export type LocalConnection = {
  type: 'local'
  user: string
  password?: string
}

export type SshConnection = {
  type: 'ssh'
  address: string
  port?: number
  user: string
  password?: string
  private_key_path?: string
}

export type DockerConnection = {
  type: 'docker'
  container: string
  user: string
  password?: string
}

export type ServerConfig = {
  name: string
  ssh_key?: {
    path: string
    passphrase: string
  }
  git_config?: { name?: string; email?: string }
  hosty_dir?: string
  docker_network?: string
  docker_prefix?: string
  connection?: LocalConnection | SshConnection | DockerConnection
  reverse_proxy?: ReverseProxy
}

export type ReverseProxy = {
  get_log_path: (server: Server) => string
  get_server_tasks: (server: Server) => Tasks
  get_service_tasks: (server: Server, config: ReverseProxyConfig) => Tasks
}

export type ReverseProxyConfig = {
  service_name: string
  domain: string
  instances: number
}

export type CaddyConfig = {
  get_server_caddyfile?: (server: Server) => string
  get_service_caddyfile?: (server: Server, config: ReverseProxyConfig) => string
}

export type Server = Required<ServerConfig> & {
  services_dir: string
  backups_dir: string
  get_service_dir: (name: string) => string
  get_backups_dir: (name: string) => string
}

export type Service<Type extends string = string> = {
  type: Type
  get_deploy_tasks: (server: Server) => Tasks
  get_destroy_tasks: (server: Server) => Tasks
}

export type ContainerConfig = {
  name: string
  files_dir?: string
  files?: Record<string, string>
  compose: compose.Service
  before_start?: string[]
}
export type Container = Service<'container'> & ContainerConfig

export type Database = Postgres | MySQL | Redis

export type PostgresConfig = Omit<ContainerConfig, 'compose'> & {
  version?: string
  user: string
  pass: string
  exposed_port?: number
  config?: string
  compose?: compose.Service
}
export type Postgres = Service<'db.postgres'> & PostgresConfig & { host: string; port: number }

export type MySQLConfig = Omit<ContainerConfig, 'compose'> & {
  version?: string
  user: string
  pass: string
  root_password: string
  exposed_port?: number
  config?: string
  compose?: compose.Service
}
export type MySQL = Service<'db.mysql'> & MySQLConfig & { host: string; port: number }

export type RedisConfig = Omit<ContainerConfig, 'compose'> & {
  version?: string
  exposed_port?: number
  config?: string
  compose?: compose.Service
}
export type Redis = Service<'db.redis'> & RedisConfig & { host: string; port: number }

export type App = GitApp

export type GitAppConfig = {
  name: string
  repo: string
  branch: string
  domain?: string
  instances?: number
  env?: Record<string, string>
  compose?: compose.Service
  before_start?: string[]
  path?: string
}

export type GitApp = Service<'app.git'> & GitAppConfig

export type CommandConfig = {
  name: string
  cmd: string
  service?: Container | App | Database
  cron?:
    | 'annually'
    | 'daily'
    | 'hourly'
    | 'monthly'
    | 'reboot'
    | 'weekly'
    | 'yearly'
    | {
        minute?: number | string // 0 - 59
        hour?: number | string // 0 - 23
        day?: number | string // 1 - 31
        weekday?: number | string // 0 - 6
        month?: number | string // 1 - 12
      }
}

export type Command = Service<'command'> & CommandConfig

export type TasksService = Service<'tasks'>

export type RunOptions = {
  playbook_path: string
  ask_sudo_pass: boolean
  spawn_options: Partial<SpawnOptions>
  ansible_options: string[]
}

export type HostyInstance = {
  deploy: (server: Server, ...services: Service[]) => void
  destroy: (server: Server, ...services: Service[]) => void
  playbook: () => Playbook
  write: (playbookPath: string) => Promise<void>
  run: (options?: Partial<RunOptions>) => Promise<ChildProcess>
}
