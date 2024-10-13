import { Server } from './types.js'
import { write } from './instance.js'
import { server as raw_server } from './server.js'

type GithubEventName = 'push' | 'pull_request' | 'delete' | 'create' | 'issue' | 'workflow_dispatch' | 'schedule' | 'release' | 'fork' | 'star'

export function server(): Server {
  const address = process.env.hosty_server_ip!
  const user = process.env.hosty_server_user!

  if (!address) var_error('server_ip')
  if (!user) var_error('server_user')

  return raw_server({
    name: 'ci_server',
    connection: { type: 'ssh', address, user },
  })
}

export function repo(type: 'ssh' | 'https' = 'ssh') {
  const repo_name = process.env.hosty_repo
  if (!repo_name) var_error('github.repository')
  if (type === 'ssh') return `git@github.com:${repo_name}.git`
  return `https://github.com/${repo_name}.git`
}

export function branch() {
  const branch = process.env.hosty_branch!
  if (!branch) var_error('github.ref_name')
  return branch
}

export function event() {
  const name = process.env.hosty_event
  if (!name) var_error('github.event_name')
  return name as GithubEventName
}

export function vars() {
  try {
    return JSON.parse(process.env.hosty_env || '{}')
  } catch {
    throw `webNeat/hosty: Could not parse the given 'vars' as JSON, make sure you serialize the passed values into a JSON string`
  }
}

export async function run() {
  return write('hosty-playbook.yaml')
}

function var_error(var_name: string) {
  throw `The Github action variable ${var_name} is missing. Make sure your are using the 'webNeat/hosty' action to run this script`
}
