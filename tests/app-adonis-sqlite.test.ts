import { test } from './utils.js'
import { app, command } from '../src/index.js'

test('app: adonis + migrations + custom dockerfile', async ({ deploy, destroy, assert }) => {
  const api = app.git({
    name: 'adonis-api',
    repo: 'https://github.com/webNeat/hosty.git',
    branch: 'main',
    path: 'examples/node-adonis-sqlite',
    domain: 'adonis-api.local',
    compose: {
      volumes: ['./storage:/app/storage'],
    },
    env: {
      TZ: 'UTC',
      PORT: '80',
      HOST: '0.0.0.0',
      LOG_LEVEL: 'info',
      APP_KEY: 'LijKdtScbgJP93CIPahDX_l5T8QSQ2-D',
      NODE_ENV: 'production',
      SESSION_DRIVER: 'cookie',
      DB_PATH: './storage/db.sqlite',
    },
  })
  const migration = command({
    name: 'run-migration',
    cmd: 'node ace migration:run --force',
    service: api,
  })

  deploy(api, migration)
  assert.command(`docker ps --filter "name=adonis-api-1"`, { stdout_contains: 'adonis-api-1' }, { become: true })
  assert.command(`sleep 10`, { success: true })
  assert.command(`curl -k https://adonis-api.local`, { success: true, stdout: `{"hello":"world"}` })
  assert.command(`curl -k https://adonis-api.local/users`, {
    success: true,
    stdout: '[]',
  })

  destroy(api)
  assert.file(`/srv/hosty/services/adonis-api`, { exists: false })
  assert.command(`docker ps -q --filter "name=adonis-api-1"`, { stdout: '' }, { become: true })
  assert.command(`curl -k https://adonis-api.local`, { success: false, stderr_contains: 'Could not resolve host: adonis-api.local' })
})
