import { test } from './utils.js'
import { app, db } from '../src/index.js'

test('app: express + postgres', async ({ deploy, destroy, assert }) => {
  const database = db.postgres({ name: 'todo-db', user: 'tasks_user', pass: 'tasks_pass' })
  const todo_app = app.git({
    name: 'todo',
    repo: 'https://github.com/webNeat/hosty.git',
    branch: 'main',
    path: 'examples/node-express-postgres',
    domain: 'todo.local',
    env: {
      APP_PORT: '80',
      DB_HOST: database.host,
      DB_USER: database.user,
      DB_PASS: database.pass,
      DB_NAME: database.name,
    },
  })

  deploy(database, todo_app)
  assert.command(`docker ps --filter "name=todo-1"`, { stdout_contains: 'todo-1' }, { become: true })
  assert.command(`sleep 10`, { success: true })
  assert.command(`curl -k https://todo.local`, { success: true, stdout: '[]' })
  assert.command(`curl -k -X POST https://todo.local -H "Content-Type: application/json" -d '{"content":"first task"}'`, {
    success: true,
    stdout: '{"id":1,"content":"first task","state":"pending"}',
  })
  assert.command(`curl -k -X POST https://todo.local -H "Content-Type: application/json" -d '{"content":"second task"}'`, {
    success: true,
    stdout: '{"id":2,"content":"second task","state":"pending"}',
  })
  assert.command(`curl -k https://todo.local`, {
    success: true,
    stdout: '[{"id":1,"content":"first task","state":"pending"},{"id":2,"content":"second task","state":"pending"}]',
  })

  destroy(todo_app, database)
  assert.file(`/srv/hosty/services/todo`, { exists: false })
  assert.command(`docker ps -q --filter "name=todo-1"`, { stdout: '' }, { become: true })
  assert.command(`curl -k https://todo.local`, { success: false, stderr_contains: 'Could not resolve host: todo.local' })
})
