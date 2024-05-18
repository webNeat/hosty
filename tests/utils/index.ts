import * as zx from 'zx'
import { Assertions, Service, instance, server } from '../../src/index.js'
import { ChildProcess } from 'child_process'

type TestCase = {
  name: string
  services: Service[]
  assertions: Assertions
}
type Failure = {
  name: string
  output: string
}

const cases: TestCase[] = []
const $ = zx.$({ quiet: true })

export async function test(name: string, config: { services: Service[]; assertions: Assertions }) {
  cases.push({ name, ...config })
}

export async function run() {
  console.log(`Checking dependencies ...`)
  if ((await $`docker --version`).exitCode) {
    throw new Error('`docker` is required to run tests, please install it first then try again!')
  }
  if ((await $`ansible-playbook --version`).exitCode) {
    throw new Error('`ansible` is required to run tests, please install it first then try again!')
  }

  console.log(`Building hosty-test docker image ...`)
  await $`docker build -t hosty-test tests/utils`

  console.log(`Running test cases ...`)
  const failures: Failure[] = []
  for (const x of cases) {
    try {
      console.log(`⏳ ${x.name}`)
      await runTestCase(x)
      console.log(`✅ ${x.name}`)
    } catch (err) {
      console.log(`❌ ${x.name}`)
      failures.push({ name: x.name, output: err as string })
    }
  }

  if (failures.length === 0) {
    await $`rm -rf .tests`
    return
  }

  for (const { name, output } of failures) {
    console.log('')
    console.log(`------------------------------------------`)
    console.log(name)
    console.log(`------------------------------------------`)
    console.log(output)
  }

  process.exit(1)
}

async function runTestCase({ name, services, assertions }: TestCase) {
  const test_name = name.replace(/[^a-zA-Z0-9]/g, '-')
  const container_name = `hosty-test-${test_name}`
  const playbookPath = `.tests/${test_name}.yaml`
  await $`docker rm -f ${container_name}`
  await $`docker run -d --name ${container_name} --privileged -v /var/run/docker.sock:/var/run/docker.sock -e ANSIBLE_FORCE_COLOR=true hosty-test`

  const container = server({
    name: 'localhost',
    connection: { type: 'docker', container: container_name, user: 'foo', password: 'foo' },
    ssh_key: { path: '/home/foo/.ssh/id_rsa', passphrase: '' },
    git_config: { name: 'Amine Ben hammou', email: 'webneat@gmail.com' },
  })
  const test_instance = instance()
  test_instance.deploy(container, [...services, assertions])

  const res = await waitProcess(await test_instance.run({ playbookPath, ask_sudo_pass: false, spawn_options: { stdio: 'pipe' } }))
  if (res.exitCode) throw res.stderr
  await $`docker stop ${container_name}`
  await $`docker rm ${container_name}`
}

type ProcessResult = {
  exitCode: number | null
  stdout: string
  stderr: string
}
async function waitProcess(ps: ChildProcess) {
  return new Promise<ProcessResult>((resolve, reject) => {
    const res: ProcessResult = { exitCode: null, stdout: '', stderr: '' }
    ps.stdout?.on('data', (data) => {
      res.stdout += data.toString()
    })
    ps.stderr?.on('data', (data) => {
      res.stderr += data.toString()
    })
    ps.on('close', (code) => {
      res.exitCode = code
      resolve(res)
    })
    ps.on('error', reject)
  })
}
