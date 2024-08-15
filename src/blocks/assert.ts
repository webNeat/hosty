import { block } from './block.js'
import { builtin } from '../ansible/tasks/index.js'
import { CommonTaskAttrs, Block } from '../ansible/index.js'

type CommandAsserts = {
  success?: boolean
  exit_code?: number
  stdout?: string
  stdout_contains?: string
  stdout_doesnt_contain?: string
  stderr?: string
  stderr_contains?: string
  stderr_doesnt_contain?: string
}
export function command(cmd: string, assertions: CommandAsserts, common: CommonTaskAttrs = {}): Block {
  const x = block(`Assert command: ${cmd}`)

  x.add(
    builtin.shell(`Run command '${cmd}'`, { cmd }, { ...common, ignore_errors: true, register: 'command_result' }),
    builtin.debug(`Show command results`, { var: 'command_result' }),
  )

  if (assertions.success === true) {
    x.add(builtin.assert(`Command '${cmd}' is successful`, { that: `command_result.rc == 0` }))
  }
  if (assertions.success === false) {
    x.add(builtin.assert(`Command '${cmd}' failed`, { that: `command_result.rc != 0` }))
  }
  if (assertions.exit_code !== undefined) {
    x.add(builtin.assert(`Command '${cmd}' exit code is ${assertions.exit_code}`, { that: `command_result.rc == ${assertions.exit_code}` }))
  }
  if (assertions.stdout !== undefined) {
    x.add(builtin.assert(`Command '${cmd}' stdout is '${assertions.stdout}'`, { that: `command_result.stdout == '${assertions.stdout}'` }))
  }
  if (assertions.stdout_contains !== undefined) {
    x.add(
      builtin.assert(`Command '${cmd}' stdout contains '${assertions.stdout_contains}'`, {
        that: `'${assertions.stdout_contains}' in command_result.stdout`,
      }),
    )
  }
  if (assertions.stdout_doesnt_contain !== undefined) {
    x.add(
      builtin.assert(`Command '${cmd}' stdout doesn't contain '${assertions.stdout_doesnt_contain}'`, {
        that: `'${assertions.stdout_doesnt_contain}' not in command_result.stdout`,
      }),
    )
  }
  if (assertions.stderr !== undefined) {
    x.add(builtin.assert(`Command '${cmd}' stderr is '${assertions.stderr}'`, { that: `command_result.stderr == '${assertions.stderr}'` }))
  }
  if (assertions.stderr_contains !== undefined) {
    x.add(
      builtin.assert(`Command '${cmd}' stderr contains '${assertions.stderr_contains}'`, {
        that: `'${assertions.stderr_contains}' in command_result.stderr`,
      }),
    )
  }
  if (assertions.stderr_doesnt_contain !== undefined) {
    x.add(
      builtin.assert(`Command '${cmd}' stderr doesn't contain '${assertions.stderr_doesnt_contain}'`, {
        that: `'${assertions.stderr_doesnt_contain}' not in command_result.stderr`,
      }),
    )
  }
  return x.get()
}

type FileAsserts = { exists?: boolean; owner?: string; group?: string; mode?: string; content_equals?: string; contains?: string; doesnt_contain?: string }
export function file(path: string, assertions: FileAsserts): Block {
  const x = block(`Assert file: ${path}`)
  x.add(builtin.stat(`Get file stat for '${path}'`, { path }, { register: 'file' }))
  if (assertions.exists === false) {
    x.add(builtin.assert(`File '${path}' exists`, { that: 'not file.stat.exists' }))
  }
  if (assertions.exists === true) {
    x.add(builtin.assert(`File '${path}' exists`, { that: 'file.stat.exists' }))
    builtin.assert(`File '${path}' is a file`, { that: 'file.stat.isreg' })
  }
  if (assertions.owner) {
    x.add(builtin.assert(`File '${path}' is owned by '${assertions.owner}'`, { that: `file.stat.pw_name == '${assertions.owner}'` }))
  }
  if (assertions.group) {
    x.add(builtin.assert(`File '${path}' group is '${assertions.group}'`, { that: `file.stat.gr_name == '${assertions.group}'` }))
  }
  if (assertions.mode) {
    x.add(builtin.assert(`File '${path}' mode is '${assertions.mode}'`, { that: `file.stat.mode == '${assertions.mode}'` }))
  }
  if (assertions.content_equals) {
    x.add(command(`cat ${path}`, { stdout: assertions.content_equals }))
  }
  if (assertions.contains) {
    x.add(command(`cat ${path}`, { stdout_contains: assertions.contains }))
  }
  if (assertions.doesnt_contain) {
    x.add(command(`cat ${path}`, { stdout_doesnt_contain: assertions.doesnt_contain }))
  }
  return x.get()
}

export function yaml(path: string, data: any): Block {
  return block(`Assert YAML: ${path}`, {}, [
    builtin.command(`Read the content of ${path}`, { cmd: `cat ${path}` }, { register: 'yaml_file_content' }),
    builtin.set_facts(`Set Yaml content variable`, { parsed_yaml_content: '{{ yaml_file_content.stdout | from_yaml }}' }),
    builtin.assert(`Compare the Yaml data`, {
      that: `parsed_yaml_content == ${JSON.stringify(data)}`,
    }),
  ]).get()
}

type DirAsserts = { owner?: string; group?: string; mode?: string }
export function dir(path: string, assertions: DirAsserts): Block {
  const x = block(`Assert directory: ${path}`)
  x.add(
    builtin.stat(`Get directory stat for '${path}'`, { path }, { register: 'dir' }),
    builtin.assert(`Directory '${path}' exists`, { that: 'dir.stat.exists' }),
    builtin.assert(`'${path}' is a directory`, { that: 'dir.stat.isdir' }),
  )
  if (assertions.owner) {
    x.add(builtin.assert(`Directory '${path}' is owned by '${assertions.owner}'`, { that: `dir.stat.pw_name == '${assertions.owner}'` }))
  }
  if (assertions.group) {
    x.add(builtin.assert(`Directory '${path}' group is '${assertions.group}'`, { that: `dir.stat.gr_name == '${assertions.group}'` }))
  }
  if (assertions.mode) {
    x.add(builtin.assert(`Directory '${path}' mode is '${assertions.mode}'`, { that: `dir.stat.mode == '${assertions.mode}'` }))
  }
  return x.get()
}
