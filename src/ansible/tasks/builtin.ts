import { CommonTaskAttrs, Host, Task } from '../types.js'

export function add_host(name: string, attrs: Host, common: CommonTaskAttrs = {}): Task<'ansible.builtin.add_host', Host> {
  return { name, 'ansible.builtin.add_host': attrs, ...common }
}

type SetFactAttrs = Record<string, any>
export function set_facts(name: string, attrs: SetFactAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.set_fact', SetFactAttrs> {
  return { name, 'ansible.builtin.set_fact': attrs, ...common }
}

type SetupAttrs = { fact_path?: string; filter?: string[]; gather_subset?: string[]; gather_timeout?: number }
export function setup(name: string, attrs: SetupAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.setup', SetupAttrs> {
  return { name, 'ansible.builtin.setup': attrs, ...common }
}

type StatAttrs = { path: string }
export function stat(name: string, attrs: StatAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.stat', StatAttrs> {
  return { name, 'ansible.builtin.stat': attrs, ...common }
}

// add fn for set_fact

type FileAttrs = { path: string; state: 'file' | 'directory'; mode?: string; owner?: string; group?: string; recurse?: boolean }
export function file(name: string, attrs: FileAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.file', FileAttrs> {
  return { name, 'ansible.builtin.file': attrs, ...common }
}

type LineInFileAttrs = { path: string; line: string; state: 'present' | 'absent' }
export function lineinfile(name: string, attrs: LineInFileAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.lineinfile', LineInFileAttrs> {
  return { name, 'ansible.builtin.lineinfile': attrs, ...common }
}

type TemplateAttrs = { src: string; dest: string }
export function template(name: string, attrs: TemplateAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.template', TemplateAttrs> {
  return { name, 'ansible.builtin.template': attrs, ...common }
}

type CopyAttrs = { src: string; dest: string } | { content: string; dest: string }
export function copy(name: string, attrs: CopyAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.copy', CopyAttrs> {
  return { name, 'ansible.builtin.copy': attrs, ...common }
}

type GetUrlAttrs = { url: string; dest: string; mode?: string }
export function get_url(name: string, attrs: GetUrlAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.get_url', GetUrlAttrs> {
  return { name, 'ansible.builtin.get_url': attrs, ...common }
}

type GitAttrs = { repo: string; dest: string; version: string; accept_hostkey: boolean }
export function git(name: string, attrs: GitAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.git', GitAttrs> {
  return { name, 'ansible.builtin.git': attrs, ...common }
}

type CommandAttrs = { cmd: string; chdir?: string; creates?: string; removes?: string }
export function command(name: string, attrs: CommandAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.command', CommandAttrs> {
  return { name, 'ansible.builtin.command': attrs, ...common }
}

type ShellAttrs = { cmd: string; chdir?: string; creates?: string; removes?: string }
export function shell(name: string, attrs: ShellAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.shell', ShellAttrs> {
  return { name, 'ansible.builtin.shell': attrs, ...common }
}

type ServiceAttrs = { name: string; state: 'started' | 'stopped' | 'restarted' }
export function service(name: string, attrs: ServiceAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.service', ServiceAttrs> {
  return { name, 'ansible.builtin.service': attrs, ...common }
}

type AptAttrs = { name?: string | string[]; deb?: string; state?: 'present' | 'absent'; update_cache?: boolean; cache_valid_time?: number }
export function apt(name: string, attrs: AptAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.apt', AptAttrs> {
  return { name, 'ansible.builtin.apt': attrs, ...common }
}

type AptKeyAttrs = { url: string; state: 'present' | 'absent' }
export function apt_key(name: string, attrs: AptKeyAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.apt_key', AptKeyAttrs> {
  return { name, 'ansible.builtin.apt_key': attrs, ...common }
}

type AptRepositoryAttrs = { repo: string; state: 'present' | 'absent'; filename?: string }
export function apt_repository(
  name: string,
  attrs: AptRepositoryAttrs,
  common: CommonTaskAttrs = {},
): Task<'ansible.builtin.apt_repository', AptRepositoryAttrs> {
  return { name, 'ansible.builtin.apt_repository': attrs, ...common }
}

export function service_facts(name: string, common: CommonTaskAttrs = {}): Task<'ansible.builtin.service_facts', {}> {
  return { name, 'ansible.builtin.service_facts': {}, ...common }
}

type AssertAttrs = { that: string; fail_msg?: string; success_msg?: string }
export function assert(name: string, attrs: AssertAttrs, common: CommonTaskAttrs = {}): Task<'ansible.builtin.assert', AssertAttrs> {
  return { name, 'ansible.builtin.assert': attrs, ...common }
}
