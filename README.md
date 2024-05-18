# Hosty

**This package is still under development, not ready for use yet!**

A code based opinionated way to self-host and manage web apps.

1. You write code describing what you want to deploy. For example:
```ts
import {app, deploy, host, database} from 'hosty'

// a Postgres database
const db = database({
  type: 'postgres',
  name: 'awesome',
  user: 'myuser',
  pass: 'mypass',
})

// a web app that uses the db above
const myapp = app({
  domain: 'your-domain.com',
  repo: 'https://github.com/....git',
  branch: 'main',
  env: {
    DB_HOST: db.host,
    DB_USER: db.user,
    DB_PASS: db.pass,
    DB_NAME: db.name,
  }
})

// The server to which you want to deploy
const server = host({
  address: 'domain name or IP'
})

// Deploy the app and database to the server
deploy(server, [db, myapp])
```
2. You run `npx hosty deploy` to apply what you described.

That's it, the database is created and your app is now deployed to `https://your-domain.com` (Yes, the SSL certificate is also taken care off!).

## Prerequisits

1. A Linux server to which you have SSH access. 
  - This can be a VPS, a home-lab server or any Linux machine that has a static IP.
  - The user by which you connect should have the `sudo` ability.
  - Only **Ubuntu** servers are supported right now.

2. [Ansible](https://www.ansible.com/) installed on your local machine.

## Get started

```
npm i hosty
```


**This package is still under development, not ready for use yet!**