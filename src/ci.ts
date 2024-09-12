import { RunOptions, Server } from './types.js'
import { write } from './instance.js'
import { server as raw_server } from './server.js'

export function server(): Server {
  const address = process.env.hosty_server_ip!
  const user = process.env.hosty_server_user!

  if (!address) input_error('server_ip')
  if (!user) input_error('server_user')

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
  try {
    const e = JSON.parse(process.env.hosty_event!)
    if (!e) var_error('github.event')
    return e
  } catch {
    var_error('github.event')
  }
}

export async function run() {
  return write('hosty-playbook.yaml')
}

function input_error(var_name: string) {
  throw `The ${var_name} input of the Github action is missing. Make sure your are using the 'webNeat/hosty' action to run this script`
}

function var_error(var_name: string) {
  throw `The Github action variable ${var_name} is missing. Make sure your are using the 'webNeat/hosty' action to run this script`
}
