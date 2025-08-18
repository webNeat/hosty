import * as zx from 'zx'
import { ChildProcess } from 'child_process'
import { HostyInstance, Server, Service, tasks, server, internals } from '../src/index.js'

const {
  instance,
  blocks: { assert },
} = internals

type Assert = {
  [K in keyof typeof assert]: (...args: Parameters<(typeof assert)[K]>) => void
}
type TestContext = {
  deploy: (...services: Service[]) => void
  destroy: (...services: Service[]) => void
  assert: Assert
}
type TestFn = (ctx: TestContext) => Promise<void>
type TestCase = {
  name: string
  fn: TestFn
}
type Failure = {
  name: string
  output: string
}

const cases: TestCase[] = []
const $ = zx.$({ quiet: true })

export async function test(name: string, fn: TestFn) {
  cases.push({ name, fn })
}

export async function run() {
  console.log(`Checking dependencies ...`)
  if ((await $`ansible-playbook --version`).exitCode) {
    throw new Error('`ansible` is required to run tests, please install it first then try again!')
  }
  await $`docker ps -q --filter "name=^/hosty-" | xargs -r docker stop`
  await $`docker ps -aq --filter "name=^/hosty-" | xargs -r docker rm`
  await $`sudo rm -rf /srv/hosty`

  console.log(`Running test cases ...`)
  const failures: Failure[] = []
  for (const x of cases) {
    try {
      console.log(`⏳ ${x.name}`)
      await run_test_case(x)
      console.log(`✅ ${x.name}`)
    } catch (err) {
      console.log(`❌ ${x.name}`)
      failures.push({ name: x.name, output: err as string })
    }
  }

  for (const { name, output } of failures) {
    console.log('')
    console.log(`------------------------------------------`)
    console.log(name)
    console.log(`------------------------------------------`)
    console.log(output)
  }

  if (failures.length > 0) {
    process.exit(1)
  }
}

async function run_test_case({ name, fn }: TestCase) {
  const test_name = name.replace(/[^a-zA-Z0-9]/g, '-') + Date.now()
  const playbook_path = `.tests/${test_name}.yaml`
  const user = (await $`whoami`).stdout.trim()

  const container = server({
    name: 'localhost',
    connection: { type: 'local', user },
    ssh_key: { path: '~/.ssh/id_rsa' },
    git_config: { name: 'Amine Ben hammou', email: 'webneat@gmail.com' },
  })
  const test_instance = instance()
  await fn(make_test_context(container, test_instance))

  const res = await wait_process(await test_instance.run({ playbook_path, ask_sudo_pass: false, spawn_options: { stdio: 'pipe' } }))
  await $`chmod 777 ${playbook_path}`
  if (res.exitCode) throw res.output
  await $`docker ps -q --filter "name=^/hosty-" | xargs -r docker stop`
  await $`docker ps -aq --filter "name=^/hosty-" | xargs -r docker rm`
  await $`sudo rm -rf /srv/hosty`
}

type ProcessResult = {
  exitCode: number | null
  output: string
}
async function wait_process(ps: ChildProcess) {
  return new Promise<ProcessResult>((resolve, reject) => {
    const res: ProcessResult = { exitCode: null, output: '' }
    ps.stdout?.on('data', (data) => {
      // console.error(data.toString())
      res.output += data.toString()
    })
    ps.stderr?.on('data', (data) => {
      // console.error(data.toString())
      res.output += data.toString()
    })
    ps.on('close', (code) => {
      res.exitCode = code
      resolve(res)
    })
    ps.on('error', reject)
  })
}

function make_test_context(server: Server, instance: HostyInstance): TestContext {
  const boundAssert: Partial<Assert> = {}
  for (const name in assert) {
    const fnName = name as keyof typeof assert
    boundAssert[fnName] = (...args) => {
      // @ts-ignore
      instance.deploy(server, tasks(assert[fnName](...args)))
    }
  }
  return {
    deploy: (...services) => instance.deploy(server, ...services),
    destroy: (...services) => instance.destroy(server, ...services),
    assert: boundAssert as Assert,
  }
}
