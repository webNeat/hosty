import os from 'os'
import path from 'path'
import { ChildProcess, exec } from 'child_process'
import { mkdir, writeFile } from 'fs/promises'
import { command, deploy, run, server, playbook } from 'hosty'
import { getInput, setFailed } from '@actions/core'
import { promisify } from 'util'

const asyncExec = promisify(exec)

async function main() {
  const server_ip = getInput('server_ip')
  const server_user = getInput('server_user')
  const ssh_private_key = getInput('ssh_private_key')
  const server_user_sudo_pass = getInput('server_user_sudo_pass')
  // const handler = getInput('handler')

  if (!server_ip) throw `Missing input 'server_ip'`
  if (!server_user) throw `Missing input 'server_user'`
  if (!ssh_private_key) throw `Missing input 'ssh_private_key'`
  if (!server_user_sudo_pass) throw `Missing input 'server_user_sudo_pass'`
  // if (!handler) throw `Missing input 'handler'`

  console.log(`Installing Ansible ...`)
  await asyncExec('sudo apt update -y')
  await asyncExec('sudo apt install software-properties-common -y')
  await asyncExec('sudo add-apt-repository --yes --update ppa:ansible/ansible')
  await asyncExec('sudo apt install ansible -y')

  console.log(`Start ssh service ...`)
  await asyncExec('sudo service ssh start')

  const home_dir = process.env['OS'] == 'Windows_NT' ? os.homedir() : os.userInfo().homedir
  const ssh_dir = path.join(home_dir, '.ssh')
  const private_key_path = path.join(ssh_dir, 'id_rsa')
  const known_hosts_path = path.join(ssh_dir, 'known_hosts')

  console.log(`Create ssh key ...`)
  await mkdir(ssh_dir, { mode: '0700', recursive: true })
  await writeFile(private_key_path, ssh_private_key)
  await asyncExec(`ssh-keyscan -t rsa,dsa,ecdsa,ed25519 ${server_ip} >> ${known_hosts_path}`)
  await asyncExec(`chmod 700 ${private_key_path}`)

  console.log(`Run the playbook ...`)
  await wait_process(
    await run({
      spawn_options: {
        env: {
          ANSIBLE_BECOME_PASS: server_user_sudo_pass,
        },
      },
    }),
  )
}
main().catch(setFailed)

async function wait_process(ps: ChildProcess) {
  return new Promise<void>((resolve, reject) => {
    ps.on('close', (code) => {
      if (code !== 0) reject(`Command failed with status code ${code}`)
      else resolve()
    })
    ps.on('error', (err) => reject(`Command failed with error ${err}`))
  })
}
