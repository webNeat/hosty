import { test } from './utils/index.js'

test('setup', async ({ assert }) => {
  assert.command(`docker --version`, { success: true })
  assert.command(`git --version`, { success: true })
  assert.command(`nixpacks --version`, { success: true })
  assert.command(`systemctl is-active caddy`, { stdout: 'active' })
})
