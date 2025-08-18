import { test } from './utils.js'
import { command } from '../src/index.js'

test('add/delete cron to/from the server', async ({ deploy, destroy, assert }) => {
  const cron = command({
    name: 'simple cron task',
    cmd: 'echo "$(date) - CPU: $(top -bn1 | grep "Cpu(s)" | sed "s/.*, *\\([0-9.]*\\)%* id.*/\\1/" | awk "{print 100 - $1}") - MEM: $(free -m | awk "/Mem:/ {printf "%.2f%%", $3*100/$2}")" >> /tmp/system_usage.log',
    cron: 'hourly',
  })

  deploy(cron)
  assert.command('crontab -l', {
    stdout_contains: 'simple cron task',
  })
  assert.command('crontab -l', {
    stdout_contains: '/tmp/system_usage.log',
  })

  destroy(cron)
  assert.command('crontab -l', {
    stdout_doesnt_contain: 'simple cron task',
  })
  assert.command('crontab -l', {
    stdout_doesnt_contain: '/tmp/system_usage.log',
  })
})
