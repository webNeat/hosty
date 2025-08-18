import { chmod, mkdir, writeFile } from 'fs/promises'
import path from 'path'
import { Readable } from 'stream'
import { setTimeout } from 'timers/promises'

const concurrency = 10

type Failure = {
  filename: string
  stdout: string
  stderr: string
}

const filenames = await get_test_files()
if (process.env.NODE_ENV === 'ci') {
  await ci_run_tests(filenames)
} else {
  const failures: Array<Failure> = []
  await Readable.from(filenames).forEach((filename) => docker_run_test(failures, filename), { concurrency })
  if (failures.length > 0) {
    for (const failure of failures) {
      await writeFile(`.tests/${failure.filename}-stdout.log`, failure.stdout)
      await writeFile(`.tests/${failure.filename}-stderr.log`, failure.stderr)
    }
    console.error(`❌ ${failures.length} tests failed, see .tests directory for logs`)
    process.exit(1)
  }
}

async function get_test_files() {
  let filenames = process.argv.slice(2)
  filenames = filenames.map((filename) => {
    if (!filename.startsWith('./')) filename = './' + filename
    return filename
  })
  if (filenames.length === 0) {
    const { glob } = await import('zx')
    filenames = await glob('./tests/*.test.ts')
  }
  return filenames
}

async function ci_run_tests(filenames: string[]) {
  const { run } = await import('./tests/utils.js')
  for (const filename of filenames) {
    await import(filename)
  }
  await run()
}

async function docker_run_test(failures: Failure[], filename: string) {
  const { $ } = await import('zx')
  const start = Date.now()
  console.log(`⏳ ${filename}`)
  const name = `hosty-test-${filename.slice(0, -8).replace(/[^a-z0-9A-Z]/g, '-')}`
  const res = await docker_exec(name, filename)
  const duration = Math.floor((Date.now() - start) / 1000)
  if (res.exitCode !== 0) {
    console.error(`❌ ${filename} (${duration}s)`)
    failures.push({
      filename: name,
      stdout: res.stdout,
      stderr: res.stderr,
    })
  } else {
    console.log(`✅ ${filename} (${duration}s)`)
  }
}

async function docker_exec(name: string, filename: string) {
  const { $ } = await import('zx')
  const exists = await $`docker inspect ${name}`.nothrow()
  if (exists.exitCode !== 0) {
    await $`docker compose run -d --name ${name} hosty dockerd --host=unix:///var/run/docker.sock --data-root=/var/lib/docker`.nothrow()
    await setTimeout(10_000)
  }
  const running = await $`docker inspect -f {{.State.Running}} ${name}`.nothrow()
  if (running.exitCode !== 0 || running.stdout.trim() !== 'true') {
    await $`docker start ${name}`.nothrow()
    await setTimeout(5_000)
  }
  return $`docker exec ${name} pnpm ci:test ${filename}`.nothrow()
}
