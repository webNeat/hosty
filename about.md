# About Hosty

## Overview

Hosty is a code-based, opinionated way to self-host and manage web applications by generating Ansible playbooks and executing them via SSH. It exposes a fluent TypeScript API to define servers, databases, reverse proxies, and applications, then handles provisioning, configuration, and deployment.

## Prerequisites

**Local machine**
- Node.js v22.x or later
- pnpm (preferred) or npm/yarn
- Ansible v2.16.x
- zx (included as a devDependency; installed via `pnpm install`)
- TypeScript v5.x

**Target server**
- Linux distro with `apt` and `systemctl` (e.g., Ubuntu 22.04)
- Non-root user with `sudo` privileges
- SSH access

## Installation & Build

```sh
git clone https://github.com/webNeat/hosty.git
cd hosty
pnpm install
pnpm run build
pnpm test
```

## Project Structure

```text
hosty/
├── about.md             # This file: detailed developer guide
├── README.md            # Quick start and overview
├── plan.md              # Roadmap and design notes
├── examples/            # Usage examples (TypeScript snippets)
├── src/                 # Source code (TypeScript modules)
│   ├── ansible/         # Playbook and task generators
│   ├── blocks/          # Reusable Ansible block definitions
│   ├── reverse_proxy/   # Reverse proxy implementations (Caddy, etc.)
│   ├── services/        # App and database resource definitions
│   ├── ci.ts            # GitHub Actions handler script
│   ├── compose.types.ts # Types for Docker/compose definitions
│   ├── files.ts         # File system utilities
│   ├── index.ts         # Public API exports
│   ├── instance.ts      # Server instance and playbook logic
│   ├── server.ts        # VPS/host definition
│   ├── types.ts         # Shared TypeScript types/interfaces
│   └── utils.ts         # Helper functions
├── tests/               # Unit and integration tests (*.test.ts)
├── action.yml           # GitHub Action composite definition
├── package.json         # NPM scripts, dependencies, metadata
├── tsconfig.json        # TypeScript compiler settings
├── tsconfig.build.json  # Build-specific TS config
├── .prettierrc          # Prettier formatting rules
├── .github/             # Workflows and issue templates
└── ...                  # Other config and lock files
```

### Where to Add Code

- **Core features**: Add new modules under `src/`. Organize by domain:
  - Ansible logic: `src/ansible/` or `src/blocks/`
  - Service providers (apps, DBs): `src/services/`
  - Reverse proxies: `src/reverse_proxy/`
  - Export APIs in `src/index.ts`
- **Tests**: Place in `tests/` named `feature.test.ts`
- **Examples**: Add in `examples/` as isolated scripts
- **CI/GitHub Actions**: Update `src/ci.ts` and `action.yml` for automation

## Coding Conventions & Style

- **Language**: TypeScript (ESM, via `"type": "module"`)
- **Naming**: Files and directories are lowercase (snake_case for multi-word names). Compose-related types live in `*.types.ts`; shared types live in `types.ts` per directory. Variables and functions use snake_case. Use PascalCase for interfaces and type aliases; no classes are used.
- **Formatting**: Prettier (`.prettierrc`):
  - `semi: false`
  - `singleQuote: true`
  - `printWidth: 155`
  - `trailingComma: all`
- **Imports/Exports**: Use named ESM imports and exports; avoid default exports in public API
- **Public API**: All top-level functions/types must be exported in `src/index.ts`
- **Indentation**: 2 spaces per level (no tabs)
- **Import File Extensions**: Include `.js` extension in all import paths to satisfy Node ESM (e.g. `import {foo} from './bar.js'`)
- **Async/Await**: Use async/await for all promise-based code; avoid callbacks
- **ES2020 Features**: Prefer nullish coalescing (`??`), optional chaining, and logical assignments (`||=`, `&&=`) for defaults and assignments
- **Error Handling**: Throw clear errors with messages prefixed by `webNeat/hosty:` in scripts and CI
- **Named Exports Only**: Avoid default exports; use named exports consistently
- **Ansible DSL**: Define tasks via `src/blocks/*` or `ansible.tasks.builtin`, never inline raw YAML
- **TypeScript Strictness**: Adhere to `strict: true`, `forceConsistentCasingInFileNames`, and other compiler options in `tsconfig.json`

## API Reference

- `server(config: ServerConfig)` – Define a VPS or host
- `database.postgres(config: PostgresConfig)` – Create a Postgres resource
- `app.git(config: GitAppConfig)` – Deploy an app from Git
- `reverse_proxy.caddy(config: CaddyConfig)` – Configure Caddy
- `deploy(...resources)` – Generate `hosty-playbook.yaml`
- `run()` – Execute the generated Ansible playbook

See `src/types.ts` and individual modules for full signatures.

## Development Workflow

1. Implement or modify code in `src/`
2. Add or update tests in `tests/`
3. Run `pnpm run build` to compile
4. Run `pnpm test` to verify
5. Update docs (`README.md`, `about.md`, `plan.md`) if needed
6. Commit and open a pull request

## Testing

- Tests are written in TypeScript using built-in assertions or frameworks
- Execute via `pnpm test` (runs `node --import tsx test.ts`)

## Examples

Browse `examples/` for sample scripts:
- `app-node-postgres/`
- `app-laravel-mysql/`
- `app-rust-nextjs/`

Copy and customize these to your setup.

## GitHub Action

Defined in `action.yml` and implemented in `src/ci.ts`:
- **Inputs**: `server_ip`, `server_user`, `ssh_private_key`, `server_sudo_pass`, `handler`, `vars`, `verbose`
- **Steps**: Set up SSH, generate playbook, run `ansible-playbook` with `hosty-playbook.yaml`

## Contributing

- Fork and PR against `main`
- Adhere to code style and add tests
- Ensure CI passes before merge

## Resources

- **Roadmap**: `plan.md`
- **Quick start**: `README.md`
- **File list**: `files.txt`
