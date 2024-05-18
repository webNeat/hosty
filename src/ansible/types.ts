export type Host = {
  name: string
  ansible_connection?: 'local' | 'docker' | 'ssh'
  ansible_host?: string
  ansible_user?: string
  ansible_port?: number
  ansible_password?: string
  ansible_ssh_private_key_file?: string
}

export type CommonTaskAttrs = {
  become?: boolean
  register?: string
  when?: string
  changed_when?: boolean
  ignore_errors?: boolean
  notify?: string
  with_fileglob?: string | string[]
}

export type Task<ModuleName extends string, ModuleAttrs> = { name: string } & { [key in ModuleName]: ModuleAttrs } & CommonTaskAttrs
export type Handler<ModuleName extends string, ModuleAttrs> = Task<ModuleName, ModuleAttrs>

export type AnyTask = Task<string, {}>
export type AnyHandler = Handler<string, {}>

export type Role = {
  tasks: AnyTask[]
  handlers: AnyTask[]
}

export type Step = {
  hosts: string
  tasks: AnyTask[]
  gather_facts?: boolean
  handlers?: AnyHandler[]
}

export type Playbook = Step[]
