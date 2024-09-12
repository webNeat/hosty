// This file was auto-generated and may contain wrong/imprecise errors
// types here will be improved as errors are found

export type ComposeFile = {
  services: Record<string, Service>
  volumes?: Record<string, Volume>
  networks?: Record<string, Network>
  configs?: Record<string, Config>
  secrets?: Record<string, Secret>
}

export type Service = {
  build?: Build
  cap_add?: string[]
  cap_drop?: string[]
  cgroup_parent?: string
  command?: string | string[]
  configs?: Array<string | ConfigReference>
  container_name?: string
  depends_on?: string[]
  deploy?: Deploy
  device_cgroup_rules?: string[]
  devices?: string[]
  dns?: string | string[]
  dns_search?: string | string[]
  domainname?: string
  entrypoint?: string | string[]
  environment?: Record<string, string | null> | string[]
  expose?: string[]
  extends?: string | { file: string; service: string }
  external_links?: string[]
  extra_hosts?: Record<string, string>
  healthcheck?: Healthcheck
  hostname?: string
  image?: string
  init?: boolean
  ipc?: string
  isolation?: string
  labels?: Record<string, string>
  links?: string[]
  logging?: Logging
  networks?: Array<string | NetworkReference>
  pid?: string
  ports?: Array<string | Port>
  privileged?: boolean
  profiles?: string[]
  read_only?: boolean
  restart?: 'no' | 'always' | 'on-failure' | 'unless-stopped'
  runtime?: string
  scale?: number
  security_opt?: string[]
  shm_size?: string
  secrets?: Array<string | SecretReference>
  stdin_open?: boolean
  stop_grace_period?: string
  stop_signal?: string
  tmpfs?: string[]
  tty?: boolean
  ulimits?: Ulimits
  user?: string
  userns_mode?: string
  volumes?: Array<string | VolumeMount>
  working_dir?: string
}

export type Build = {
  context: string
  dockerfile?: string
  args?: Record<string, string>
  cache_from?: string[]
  labels?: Record<string, string>
  network?: string
  shm_size?: string
  target?: string
}

export type Config = {
  name: string
  file?: string
  external?: boolean | { name: string }
  labels?: Record<string, string>
}

export type ConfigReference = {
  source: string
  target?: string
  uid?: string
  gid?: string
  mode?: number
}

export type Deploy = {
  mode?: string
  replicas?: number
  labels?: Record<string, string>
  update_config?: UpdateConfig
  rollback_config?: RollbackConfig
  resources?: Resources
  restart_policy?: RestartPolicy
  placement?: Placement
  endpoint_mode?: string
}

export type UpdateConfig = {
  parallelism?: number
  delay?: string
  failure_action?: string
  monitor?: string
  max_failure_ratio?: number
  order?: string
}

export type RollbackConfig = {
  parallelism?: number
  delay?: string
  failure_action?: string
  monitor?: string
  max_failure_ratio?: number
  order?: string
}

export type Resources = {
  limits?: Resource
  reservations?: Resource
}

export type Resource = {
  cpus?: string
  memory?: string
}

export type RestartPolicy = {
  condition?: string
  delay?: string
  max_attempts?: number
  window?: string
}

export type Placement = {
  constraints?: string[]
  preferences?: PlacementPreference[]
  max_replicas_per_node?: number
}

export type PlacementPreference = {
  spread: string
}

export type Healthcheck = {
  test?: string[]
  interval?: string
  timeout?: string
  retries?: number
  start_period?: string
  disable?: boolean
}

export type Logging = {
  driver: string
  options?: Record<string, string>
}

export type NetworkReference = {
  aliases?: string[]
  ipv4_address?: string
  ipv6_address?: string
  link_local_ips?: string[]
  priority?: number
}

export type Port = {
  target: number
  published?: number
  protocol?: string
  mode?: string
}

export type Ulimits = {
  nproc?: number
  nofile?: { soft: number; hard: number }
}

export type VolumeMount = {
  type?: string
  source?: string
  target: string
  read_only?: boolean
  consistency?: string
  bind?: Bind
  volume?: VolumeOptions
  tmpfs?: TmpfsOptions
}

export type Bind = {
  propagation?: string
  create_host_path?: boolean
}

export type VolumeOptions = {
  nocopy?: boolean
}

export type TmpfsOptions = {
  size?: number
}

export type Volume = {
  driver?: string
  driver_opts?: Record<string, string>
  external?: boolean | { name: string }
  labels?: Record<string, string>
  name?: string
}

export type Network = {
  driver?: string
  driver_opts?: Record<string, string>
  external?: boolean | { name: string }
  labels?: Record<string, string>
  name?: string
  attachable?: boolean
  enable_ipv6?: boolean
  internal?: boolean
  ipam?: IPAM
}

export type IPAM = {
  driver?: string
  config?: IPAMConfig[]
  options?: Record<string, string>
}

export type IPAMConfig = {
  subnet?: string
  ip_range?: string
  gateway?: string
  aux_addresses?: Record<string, string>
}

export type Secret = {
  name: string
  file?: string
  external?: boolean | { name: string }
  labels?: Record<string, string>
  driver?: string
  driver_opts?: Record<string, string>
}

export type SecretReference = {
  source: string
  target?: string
  uid?: string
  gid?: string
  mode?: number
}
