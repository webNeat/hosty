import { Postgres, PostgresConfig } from '../types.js'
import { container } from './container.js'

export function postgres(config: PostgresConfig): Postgres {
  const service = container({
    name: config.name,
    compose: {
      image: `postgres:${config.version || 'latest'}`,
      // ...
    },
  })
  return {
    ...config,
    host: config.name,
    get_roles: service.get_roles,
  }
}
