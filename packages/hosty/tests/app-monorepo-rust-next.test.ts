import { test } from './utils/index.js'
import { app } from '../src/index.js'

test('app: monorepo rust + nextjs', async ({ deploy, destroy, assert }) => {
  const api = app.git({
    name: 'rust-api',
    repo: 'https://github.com/webNeat/hosty-test-apps.git',
    branch: 'monorepo',
    path: 'api',
    domain: 'rust-api.local',
  })

  const web = app.git({
    name: 'next-web',
    repo: 'https://github.com/webNeat/hosty-test-apps.git',
    branch: 'monorepo',
    path: 'web',
    domain: 'next-web.local',
    env: {
      PORT: '80',
      API_URL: 'http://rust-api-1',
    },
  })

  deploy(api, web)
  assert.command(`docker ps --filter "name=rust-api-1"`, { stdout_contains: 'rust-api-1' }, { become: true })
  assert.command(`docker ps --filter "name=next-web-1"`, { stdout_contains: 'next-web-1' }, { become: true })
  assert.command(`curl -k https://rust-api.local/greet/foo`, { success: true, stdout: '{"hello":"foo"}' })
  assert.command(`curl -k https://rust-api.local/fibonacci/10`, { success: true, stdout: '{"value":55}' })
  assert.command(`curl -k https://next-web.local`, { success: true, stdout_contains: '<h1>Fibonacci of <!-- -->1<!-- --> is <!-- -->1</h1>' })
  assert.command(`curl -k https://next-web.local?n=11`, { success: true, stdout_contains: '<h1>Fibonacci of <!-- -->11<!-- --> is <!-- -->89</h1>' })

  destroy(web, api)
  assert.file(`/srv/hosty/services/rust-api`, { exists: false })
  assert.file(`/srv/hosty/services/next-web`, { exists: false })
  assert.command(`docker ps -q --filter "name=rust-api-1"`, { stdout: '' }, { become: true })
  assert.command(`docker ps -q --filter "name=next-web-1"`, { stdout: '' }, { become: true })
  assert.command(`curl -k https://rust-api.local`, { success: false, stderr_contains: 'Could not resolve host: rust-api.local' })
  assert.command(`curl -k https://next-web.local`, { success: false, stderr_contains: 'Could not resolve host: next-web.local' })
})
