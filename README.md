# Hosty

A code based opinionated way to self-host and manage web apps.

# Quick Example

```ts
import {app, db, deploy, run} from 'hosty'

// 1. Specify what you want to deploy

// A postgres database
const database = db.postgres({
  name: 'my-db',
  user: 'db_user',
  pass: 'db_pass'
})

// An application from a Git repo
const api = app.git({
  name: 'my-api',
  repo: 'https://url-to-my-repo.git',
  branch: 'main',
  domain: 'my-api-domain.com',
  env: {
    PORT: '80',
    DB_HOST: database.host,
    DB_USER: database.user,
    DB_PASS: database.pass,
    DB_NAME: database.name,
  },
})

// 2. Specify where you want deploy
const myVPS = server({
  name: '188.114.97.6' // hostname or IP
})

// 3. Deploy
deploy(myVPS, database, api)
run()
```

This code will do the following:
1. Connect to your server via SSH
2. Create the postgres database
3. Clone your repo, build and run it
4. Configure the domain with https support

# Requirements
**On local machine:**
- [Ansible](https://www.ansible.com/) (tested with v2.16.6)
- Node.js (tested with v22.8)

**On the server**
- A Linux server that uses `apt` and `systemctl` (tested on Ubuntu 22.04)
- A user with `sudo` ability (using the root user is not recommended)

_The detailed documentation is coming soon ..._