import { readFile } from 'fs/promises'
import { test } from './utils.js'
import { container } from '../src/index.js'

test('simple container', async ({ deploy, destroy, assert }) => {
  const test_container = container({
    name: 'foo',
    compose: {
      image: 'nginx',
      ports: ['8080:8080'],
    },
    files_dir: 'tests/files',
    files: {
      'baz.txt': 'Yo',
      'inner/lorem.txt': 'ipsum',
    },
  })

  deploy(test_container)
  assert.command(`docker ps --filter "name=foo"`, { stdout_contains: 'foo' }, { become: true }) // the `foo` container is running
  assert.yaml(`/srv/hosty/services/foo/compose.yaml`, {
    services: {
      foo: {
        container_name: 'foo',
        networks: ['hosty'],
        restart: 'unless-stopped',
        image: 'nginx',
        ports: ['8080:8080'],
      },
    },
    networks: {
      hosty: { external: true },
    },
  })
  assert.file(`/srv/hosty/services/foo/foo.txt`, { content_equals: await readFile(`tests/files/foo.txt`, 'utf8') })
  assert.file(`/srv/hosty/services/foo/bar.txt`, { content_equals: await readFile(`tests/files/bar.txt`, 'utf8') })
  assert.file(`/srv/hosty/services/foo/baz.txt`, { content_equals: 'Yo' })
  assert.file(`/srv/hosty/services/foo/inner/lorem.txt`, { content_equals: 'ipsum' })

  destroy(test_container)
  assert.command(`docker ps -q --filter "name=foo"`, { stdout: '' }, { become: true })
  assert.file(`/srv/hosty/services/foo`, { exists: false })
})
