import { test } from './utils/index.js'
import { assert, assertions, container } from '../src/index.js'

test('simple docker container', {
  services: [
    container({
      name: 'foo',
      compose: {
        image: 'nginx',
        ports: ['8080:8080'],
      },
    }),
  ],
  assertions: assertions(
    assert.command(`docker ps --filter "name=foo"`, { stdout_contains: 'foo' }, { become: true }), // the `foo` container is running
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
    }),
  ),
})
