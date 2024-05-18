import { test } from './utils/index.js'
import { assert, assertions } from '../src/index.js'

test('setup', {
  services: [],
  assertions: assertions(
    assert.command(`docker --version`, { success: true }),
    assert.command(`git --version`, { success: true }),
    assert.command(`nixpacks --version`, { success: true }),
  ),
})
