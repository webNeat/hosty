import { test } from './utils/index.js'
import { db, command } from '../src/index.js'

test('add/delete cron to/from a service', async ({ deploy, destroy, assert }) => {
  const database = db.postgres({
    name: 'my-db',
    user: 'demo',
    pass: 'supersecret',
  })
  const cron = command({
    name: 'backup my db',
    cmd: 'pg_dump -U demo my-db > /srv/backups/my-db/$(date +%Y-%m-%d).sql',
    cron: 'daily',
    service: database,
  })

  const service_dir = `/srv/hosty/services/my-db`

  deploy(cron)
  assert.command('crontab -l', {
    stdout_contains: 'backup my db',
  })
  assert.command('crontab -l', {
    stdout_contains: `@daily cd ${service_dir} && docker compose run --rm my-db pg_dump -U demo my-db > /srv/backups/my-db/$(date +%Y-%m-%d).sql`,
  })

  destroy(cron)
  assert.command('crontab -l', {
    stdout_doesnt_contain: `cd ${service_dir} && docker compose run --rm my-db`,
  })
})
