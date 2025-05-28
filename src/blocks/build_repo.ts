import path from 'path'
import * as YAML from 'yaml'
import { block } from './block.js'
import { Block } from '../ansible/types.js'
import { builtin } from '../ansible/tasks/index.js'
import { create_directory } from './create_directory.js'

type Config = {
  repo_url: string
  branch: string
  service_dir: string
  image_name: string
  facts: {
    source_changed: string
  }
  path?: string
  env?: Record<string, string>
}

export function build_repo(config: Config): Block {
  const source_path = path.join(config.service_dir, 'source.yaml')
  const source_content = { repo: config.repo_url, branch: config.branch, commit: '{{commit_hash}}', path: config.path }
  const build_path = config.path ? path.join('{{clone_dir.path}}', config.path) : '{{clone_dir.path}}'
  return block(`Clone and build repo: ${config.repo_url}`, {}, [
    create_directory(config.service_dir),
    builtin.command(`Get last commit hash`, { cmd: `git ls-remote ${config.repo_url} ${config.branch}` }, { register: 'git_ls_remote' }),
    builtin.set_facts(`Set commit hash in a var`, { commit_hash: `{{git_ls_remote.stdout.split()[0]}}` }),
    builtin.copy(`Write the source info`, { content: YAML.stringify(source_content), dest: source_path }, { register: 'source_file' }),
    builtin.set_facts(`Set source changed fact`, { [config.facts.source_changed]: '{{source_file.changed}}' }),
    builtin.tempfile(`Create a temp dir to clone the repo`, { state: 'directory' }, { register: 'clone_dir', when: 'source_file.changed' }),
    builtin.git(
      `Clone the repo`,
      { repo: config.repo_url, version: config.branch, accept_hostkey: true, dest: '{{clone_dir.path}}', depth: 1 },
      { when: 'source_file.changed' },
    ),
    builtin.copy(
      `Create .env file`,
      {
        content: Object.entries(config.env || {})
          .map(([key, value]) => `${key}=${value}`)
          .join('\n'),
        dest: path.join(build_path, '.env'),
      },
      { when: 'source_file.changed' },
    ),
    builtin.stat(`Check if Dockerfile exists`, { path: path.join(build_path, 'Dockerfile') }, { register: 'dockerfile', when: 'source_file.changed' }),
    builtin.command(
      `Build the app using Dockerfile`,
      { cmd: `docker build -t ${config.image_name} ${build_path}` },
      { when: 'source_file.changed and dockerfile.stat.exists' },
    ),
    builtin.command(
      `Build the app using nixpacks`,
      { cmd: `nixpacks build ${build_path} --name ${config.image_name}` },
      { when: 'source_file.changed and not dockerfile.stat.exists' },
    ),
    builtin.file(`Delete clone dir`, { path: '{{clone_dir.path}}', state: 'absent' }, { when: 'source_file.changed' }),
  ]).get()
}
