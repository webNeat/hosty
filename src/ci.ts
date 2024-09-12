import { RunOptions, Server } from './types.js'
import { run as raw_run } from './instance.js'
import { server as raw_server } from './server.js'

export function server(): Server {
  const address = process.env.hosty_server_ip!
  const user = process.env.hosty_server_user!

  if (!address) error('server_ip')
  if (!user) error('server_user')

  return raw_server({
    name: 'ci_server',
    connection: { type: 'ssh', address, user },
  })
}

export async function run(options: Partial<RunOptions> = {}) {
  const sudo_pass = process.env.hosty_server_sudo_pass
  if (!sudo_pass) error('server_sudo_pass')

  options.spawn_options ||= {}
  options.spawn_options.env ||= {}
  options.spawn_options.env.ANSIBLE_BECOME_PASS = sudo_pass
  return raw_run(options)
}

function error(var_name: string) {
  throw `The ${var_name} input of the Github action is missing. Make sure your are using the 'webNeat/hosty' action to run this script`
}
