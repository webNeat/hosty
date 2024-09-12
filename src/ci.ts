import { RunOptions, Server } from './types.js'
import { write } from './instance.js'
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

export async function run() {
  return write('hosty-playbook.yaml')
}

function error(var_name: string) {
  throw `The ${var_name} input of the Github action is missing. Make sure your are using the 'webNeat/hosty' action to run this script`
}
