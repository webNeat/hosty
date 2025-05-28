import { test } from './utils.js'
import { app, db } from '../src/index.js'

test('app: laravel + mysql + custom dockerfile', async ({ deploy, destroy, assert }) => {
  const database = db.mysql({ name: 'laravel-db', user: 'laravel_user', pass: 'laravel_pass', root_password: 'supersecretpass' })
  const laravel_app = app.git({
    name: 'laravel-app',
    repo: 'https://github.com/webNeat/hosty.git',
    branch: 'main',
    path: 'examples/php-laravel-mysql',
    domain: 'laravel.local',
    env: {
      APP_NAME: '"Laravel App"',
      APP_ENV: 'production',
      APP_KEY: '"base64:MwtP4zRRiQnznkVkAPbKwwB9768wKSwHp4hYF7P5B8k="',
      APP_DEBUG: 'true',
      APP_TIMEZONE: 'UTC',
      APP_PORT: '80',
      APP_URL: 'https://laravel-app.local',
      APP_LOCALE: 'en',
      APP_FALLBACK_LOCALE: 'en',
      APP_FAKER_LOCALE: 'en_US',
      APP_MAINTENANCE_DRIVER: 'file',
      BCRYPT_ROUNDS: '12',
      LOG_CHANNEL: 'stack',
      LOG_STACK: 'single',
      LOG_DEPRECATIONS_CHANNEL: 'null',
      LOG_LEVEL: 'debug',
      DB_CONNECTION: 'mysql',
      DB_HOST: database.host,
      DB_PORT: `${database.port}`,
      DB_DATABASE: database.name,
      DB_USERNAME: database.user,
      DB_PASSWORD: database.pass,
      SESSION_DRIVER: 'database',
      SESSION_LIFETIME: '120',
      SESSION_ENCRYPT: 'false',
      SESSION_PATH: '/',
      SESSION_DOMAIN: 'null',
      BROADCAST_CONNECTION: 'log',
      FILESYSTEM_DISK: 'local',
      QUEUE_CONNECTION: 'database',
      CACHE_STORE: 'database',
      CACHE_PREFIX: '',
      MEMCACHED_HOST: '127.0.0.1',
      REDIS_CLIENT: 'phpredis',
      REDIS_HOST: '127.0.0.1',
      REDIS_PASSWORD: 'null',
      REDIS_PORT: '6379',
      MAIL_MAILER: 'log',
      MAIL_HOST: '127.0.0.1',
      MAIL_PORT: '2525',
      MAIL_USERNAME: 'null',
      MAIL_PASSWORD: 'null',
      MAIL_ENCRYPTION: 'null',
      MAIL_FROM_ADDRESS: '"hello@example.com"',
      MAIL_FROM_NAME: '"${APP_NAME}"',
      AWS_ACCESS_KEY_ID: '',
      AWS_SECRET_ACCESS_KEY: '',
      AWS_DEFAULT_REGION: 'us-east-1',
      AWS_BUCKET: '',
      AWS_USE_PATH_STYLE_ENDPOINT: 'false',
      VITE_APP_NAME: '"${APP_NAME}"',
    },
  })

  deploy(database, laravel_app)
  assert.command(`docker ps --filter "name=laravel-app-1"`, { stdout_contains: 'laravel-app-1' }, { become: true })
  assert.command(`docker ps --filter "name=laravel-db"`, { stdout_contains: 'laravel-db' }, { become: true })
  assert.command(`curl -k https://laravel.local`, { success: true, stdout: `{"hello":"world!"}` })
  assert.command(`curl -k https://laravel.local/users`, {
    success: true,
    stdout_contains: '[{"id":1,"name":"Test User","email":"test@example.com","email_verified_at":null,',
  })

  destroy(laravel_app, database)
  assert.file(`/srv/hosty/services/laravel-app`, { exists: false })
  assert.command(`docker ps -q --filter "name=laravel-app-1"`, { stdout: '' }, { become: true })
  assert.command(`docker ps -q --filter "name=laravel-db"`, { stdout: '' }, { become: true })
  assert.command(`sleep 20`, { stdout: '' })
  assert.command(`curl -k https://laravel.local`, { success: false, stderr_contains: 'Could not resolve host: laravel.local' })
})
