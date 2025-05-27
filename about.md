# About Hosty

## Overview

Hosty is a code-based, opinionated way to self-host and manage web applications by generating Ansible playbooks and executing them via SSH. It exposes a fluent TypeScript API to define servers, databases, reverse proxies, and applications, then handles provisioning, configuration, and deployment.

## Core Concepts & Workflow

Hosty bridges the gap between defining your infrastructure in code and having it deployed on your servers. It achieves this by translating your TypeScript declarations into executable Ansible playbooks.

The typical workflow is as follows:

1.  **Define Resources**: In a TypeScript file (e.g., `deploy.ts`), you use Hosty's API (`app`, `db`, `server`, `reverse_proxy`) to declare the desired state of your infrastructure. This includes:
    *   Server(s) you want to deploy to.
    *   Databases (e.g., PostgreSQL).
    *   Applications (e.g., from a Git repository, potentially as Docker containers).
    *   Reverse proxy configurations (e.g., Caddy for automatic HTTPS).

2.  **Generate Playbook**: You call the `deploy(...resources)` function, passing in all your defined resources. Hosty processes these definitions and generates an Ansible playbook named `hosty-playbook.yaml` in your project's root directory. This playbook contains all the necessary Ansible tasks to provision, configure, and deploy your resources.

3.  **Execute Playbook**:
    *   **Locally**: You call the `run()` function. This function invokes `ansible-playbook` to execute the generated `hosty-playbook.yaml` against the target server(s) specified in your definitions. It handles SSH connections and sudo privileges as configured.
    *   **Via GitHub Actions**: The Hosty GitHub Action (`action.yml`) automates this process. It checks out your code, runs your deployment script (specified by the `handler` input), which generates the playbook, and then executes the playbook. Inputs like `server_ip`, `ssh_private_key`, etc., are used to configure the connection.

4.  **Server Provisioning**: Ansible, guided by the playbook, connects to your server(s) via SSH. It then performs tasks such as:
    *   Installing necessary software (e.g., Docker, Caddy, PostgreSQL client/server).
    *   Setting up users and permissions.
    *   Configuring databases.
    *   Cloning application repositories.
    *   Building and running applications (often as Docker containers managed by Docker Compose, based on your app definition).
    *   Configuring the reverse proxy (e.g., Caddy) to route traffic to your applications and enable HTTPS automatically.

Hosty's opinionated approach means it makes certain choices for you (e.g., using Caddy, promoting Docker for applications) to simplify the deployment process, while still offering configuration options.

## Key Components Under the Hood

Hosty's functionality is built upon several key components working together:

### 1. TypeScript API & Resource Definitions
   - **`src/index.ts`**: Exports the public API functions like `server`, `app.git`, `db.postgres`, `reverse_proxy.caddy`, `deploy`, and `run`.
   - **`src/server.ts`**: Defines the `ServerConfig` and logic for representing target servers.
   - **`src/services/`**: Contains modules for defining various deployable services:
     - `db_postgres.ts` (example): Logic for PostgreSQL database resources.
     - `app_git.ts` (example): Logic for applications deployed from Git repositories. This often involves generating Docker Compose configurations.
     - `compose.types.ts`: TypeScript definitions related to Docker Compose, indicating that applications are often containerized.
   - **`src/reverse_proxy/`**: Handles reverse proxy setup.
     - `caddy.ts` (example): Implements Caddy configuration, including domain setup and automatic HTTPS.

### 2. Ansible Playbook Generation
   - **`src/instance.ts`**: This is a central piece that takes the user-defined resources, processes them, and orchestrates the generation of the Ansible playbook (`hosty-playbook.yaml`). It translates the high-level TypeScript definitions into specific Ansible tasks and roles.
   - **`src/ansible/`**: Contains utilities and helper functions for generating Ansible tasks and playbook structures in YAML format. It might include templates or functions to create common Ansible constructs.
   - **`src/blocks/`**: Defines reusable Ansible blocks or task lists for common operations (e.g., installing a package, managing a service, configuring a user). These blocks are then assembled by `src/instance.ts` into the final playbook. The goal is to avoid writing raw YAML directly and instead use these typed, reusable TypeScript functions.

### 3. Execution Engine
   - The `run()` function (typically called after `deploy()`) or the GitHub Action (`action.yml`) uses the system's `ansible-playbook` command to execute the generated `hosty-playbook.yaml`.
   - SSH connection details (IP, user, key, sudo password) are passed to Ansible to enable it to connect to and manage the remote server.
   - **`zx` library**: Hosty may use `zx` (listed in devDependencies) internally for scripting interactions with the shell, such as invoking Ansible.

This architecture allows Hosty to provide a developer-friendly TypeScript interface while leveraging the power and idempotency of Ansible for the actual server configuration and deployment tasks.

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

## Detailed API Reference

The public API is exported from `src/index.ts`. Key functions include:

### `server(config: ServerConfig): Server`
Defines a target server for deployment.

-   **`config: ServerConfig`**:
    -   `name: string`: A unique name for the server (e.g., IP address or hostname). This is used by Ansible as the inventory host.
    -   `user?: string`: The SSH user to connect with (defaults to a common user if not provided by GitHub Action).
    -   `pass?: string`: The sudo password for the user on the server.
    -   `vars?: Record<string, any>`: Additional Ansible variables specific to this host.
-   **Returns**: A `Server` object representing the configured server.

**Example:**
```typescript
const myVPS = server({
  name: '192.168.1.100', // IP or hostname
  user: 'deploy_user',
  pass: 'sudo_password_here'
});
```

### `db.postgres(config: PostgresConfig): PostgresDb`
Defines a PostgreSQL database resource to be provisioned.

-   **`config: PostgresConfig`**:
    -   `name: string`: The name of the database to create.
    -   `user: string`: The username for the database.
    -   `pass: string`: The password for the database user.
    -   `version?: string`: (Optional) Specify PostgreSQL version.
    -   `extensions?: string[]`: (Optional) List of PostgreSQL extensions to enable.
-   **Returns**: A `PostgresDb` object containing details like generated host, user, pass, and name, which can be used as environment variables for applications.

**Example:**
```typescript
const mainDb = db.postgres({
  name: 'my_app_db',
  user: 'app_user',
  pass: 's3cureP@ssw0rd'
});
```

### `app.git(config: GitAppConfig): GitApp`
Defines an application to be deployed from a Git repository. Hosty typically packages these as Docker containers using Docker Compose.

-   **`config: GitAppConfig`**:
    -   `name: string`: A unique name for the application.
    -   `repo: string`: The URL of the Git repository.
    -   `branch?: string`: (Optional) The Git branch to deploy (defaults to `main` or `master`).
    -   `domain?: string | string[]`: (Optional) The domain(s) to configure for this application via the reverse proxy (e.g., Caddy). If provided, HTTPS is usually set up automatically.
    -   `env?: Record<string, string | number | { secret: string }>`: Environment variables for the application. Values can be direct strings/numbers or references to secrets.
    -   `ports?: string[]`: (Optional) Port mappings (e.g., `"8080:80"`). Often handled by Docker Compose.
    -   `build?: { command?: string; dockerfile?: string; context?: string }`: (Optional) Build instructions. If a `dockerfile` is specified, Hosty will likely build a Docker image.
    -   `volumes?: string[]`: (Optional) Docker volume mappings.
    -   `depends_on?: (GitApp | PostgresDb)[]`: (Optional) Declare dependencies on other resources.
-   **Returns**: A `GitApp` object.

**Example:**
```typescript
const myApi = app.git({
  name: 'my-cool-api',
  repo: 'https://github.com/user/my-api.git',
  branch: 'develop',
  domain: 'api.example.com',
  env: {
    PORT: '3000',
    DATABASE_URL: `postgresql://${mainDb.user}:${mainDb.pass}@${mainDb.host}/${mainDb.name}`,
    API_KEY: { secret: 'MY_API_KEY_SECRET_NAME' } // Example for secret handling
  },
  build: {
    dockerfile: './Dockerfile' // Assumes a Dockerfile in the repo
  }
});
```

### `reverse_proxy.caddy(config: CaddyConfig): CaddyProxy`
(Implicitly used or explicitly configurable) Configures Caddy as the reverse proxy. Typically, Caddy is automatically configured when `domain` is specified in `app.git`. Explicit configuration might be for advanced scenarios.

-   **`config: CaddyConfig`**:
    -   `email?: string`: Email for Let's Encrypt SSL certificate registration.
    -   `extra_config?: string`: Additional raw Caddyfile snippets.
-   **Returns**: A `CaddyProxy` object.

**Note**: Caddy is often managed automatically. You might not need to call this directly unless customizing global Caddy settings.

### `deploy(server: Server, ...resources: (GitApp | PostgresDb | CaddyProxy)[])`
Generates the `hosty-playbook.yaml` Ansible playbook based on the defined server and resources.

-   **`server: Server`**: The target server object obtained from `server()`.
-   **`...resources`: (GitApp | PostgresDb | CaddyProxy)[]**: A list of application, database, or explicit proxy resources to deploy.
-   **Effect**: Creates/overwrites `hosty-playbook.yaml` in the current directory.

**Example:**
```typescript
deploy(myVPS, mainDb, myApi);
```

### `run(options?: { verbose?: boolean; vars?: Record<string, any> })`
Executes the generated `hosty-playbook.yaml` using `ansible-playbook`.

-   **`options?`**:
    -   `verbose?: boolean`: (Optional) Run Ansible with increased verbosity (`-v`).
    -   `vars?: Record<string, any>`: (Optional) Extra variables to pass to the Ansible playbook.
-   **Effect**: Connects to the server via SSH and applies the playbook.

**Example:**
```typescript
async function main() {
  // ... define myVPS, mainDb, myApi ...
  deploy(myVPS, mainDb, myApi);
  await run({ verbose: true });
}
main();
```

For the most precise and up-to-date details on configuration options and types, refer to the source code in `src/types.ts`, `src/server.ts`, `src/services/`, and `src/reverse_proxy/`.

## Secret Management

Managing sensitive information like API keys, database passwords, and other credentials securely is crucial. Hosty provides a mechanism to reference secrets, which are then expected to be available in the execution environment.

When defining an application's environment variables using `app.git`, you can specify a secret like so:

```typescript
const myApi = app.git({
  // ... other config ...
  env: {
    API_KEY: { secret: 'MY_APP_API_KEY' },
    DB_PASSWORD: { secret: 'DATABASE_PASSWORD_SECRET' }
  }
});
```

Hosty itself doesn't store or encrypt secrets. Instead, it relies on the environment where `ansible-playbook` (either via `run()` or the GitHub Action) is executed to provide these secrets as environment variables.

### Supplying Secrets

1.  **Local Execution (using `run()`):**
    When running Hosty locally, the Ansible playbook (`hosty-playbook.yaml`) generated by `deploy()` will expect the secrets (e.g., `MY_APP_API_KEY`, `DATABASE_PASSWORD_SECRET` from the example above) to be available as environment variables in the shell where you execute `run()`.

    For example, before running your Hosty script:
    ```bash
    export MY_APP_API_KEY="your_actual_api_key_value"
    export DATABASE_PASSWORD_SECRET="your_db_password"
    # Then run your node script that calls deploy() and run()
    node deploy.ts
    ```
    Alternatively, you can use tools like `direnv` or `.env` files (loaded by a library like `dotenv` in your deployment script *before* Hosty's `run()` is called) to manage these environment variables for local development. Hosty's `run()` function itself can also accept `vars` which can be sourced from environment variables.

2.  **GitHub Actions Execution:**
    When using Hosty as a GitHub Action, you should store your secrets as [GitHub Encrypted Secrets](https://docs.github.com/en/actions/security-guides/encrypted-secrets) in your repository settings (e.g., `Settings > Secrets and variables > Actions`).

    The `action.yml` for Hosty would then need to pass these GitHub secrets as environment variables to the `ansible-playbook` command. The `vars` input of the Hosty GitHub action can be used for this, or the action might be designed to automatically look for environment variables matching the secret names.

    For instance, if your Hosty script references `{ secret: 'MY_APP_API_KEY' }`, you would create a GitHub secret named `MY_APP_API_KEY`. The GitHub Action workflow would then need to make this available as an environment variable to the step running Hosty.

    Example snippet in a GitHub workflow:
    ```yaml
    - name: Run Hosty Deployment
      uses: webNeat/hosty@v1 # Or your specific version
      with:
        # ... other inputs like server_ip, ssh_private_key ...
        handler: 'deploy.ts' # Your Hosty script
      env:
        MY_APP_API_KEY: ${{ secrets.MY_APP_API_KEY }}
        DATABASE_PASSWORD_SECRET: ${{ secrets.DATABASE_PASSWORD_SECRET }}
    ```
    The Hosty action's internal script (`src/ci.ts`) would then ensure these environment variables are accessible when Ansible is run.

### Best Practices:

*   **Never hardcode secrets** directly in your Hosty TypeScript files or commit them to version control.
*   Use descriptive names for your secrets (e.g., `STRIPE_API_KEY` rather than just `API_KEY`).
*   Limit the scope and permissions of secrets to the minimum required.
*   Regularly rotate secrets.

## Troubleshooting & Debugging

Deployments can sometimes run into issues. Here are common areas to check and tips for debugging Hosty deployments:

### 1. SSH Connection Issues

*   **Verify SSH Access**: Ensure you can manually SSH into the target server from the machine running Hosty (or from the GitHub Actions runner environment if applicable) using the specified user and SSH key.
    ```bash
    ssh -i /path/to/your/private_key user@server_ip
    ```
*   **SSH Key Format & Permissions**: Ensure your SSH private key is in the correct format (usually OpenSSH) and has appropriate file permissions (e.g., `chmod 600 /path/to/your/private_key`).
*   **`known_hosts`**: The Hosty GitHub Action attempts to add the server to `known_hosts`. Locally, you might need to do this manually upon first connection or ensure host key checking is handled if it's a new server.
*   **Firewall**: Check if a firewall on the server or an intermediary network is blocking SSH connections (default port 22).

### 2. Ansible Playbook Errors

When `run()` or the GitHub Action executes `ansible-playbook`, errors might occur.

*   **Verbose Output**: 
    *   Locally: Use `await run({ verbose: true });` in your Hosty script.
    *   GitHub Action: Set the `verbose: true` input for the Hosty action.
    This will provide more detailed output from Ansible, often pinpointing the exact task that failed and the reason.
*   **Inspect `hosty-playbook.yaml`**: After `deploy()` runs, this file is generated in your project root. Review its contents to understand the tasks Ansible is trying to execute. This can help you see if the generated playbook matches your expectations.
*   **Common Ansible Errors**:
    *   *Package not found*: The package name might be incorrect for the server's OS, or the package repositories might need updating (`apt update`).
    *   *Service failing to start*: Check service logs on the server (e.g., `sudo systemctl status <service_name>`, `sudo journalctl -u <service_name>`).
    *   *Permission denied*: The SSH user might not have sufficient `sudo` privileges for a specific task, or file permissions on the server might be incorrect.
    *   *Template errors*: If Hosty uses Ansible templates, there might be syntax issues or missing variables in the template.

### 3. Application Deployment Failures (e.g., Docker-based apps)

If Ansible tasks complete but your application isn't working:

*   **Docker Logs**: If your application is containerized (common with `app.git`), check the Docker container logs on the server:
    ```bash
    sudo docker ps -a # List all containers, find your app's container ID or name
    sudo docker logs <container_id_or_name>
    ```
*   **Docker Build Issues**: If Hosty builds a Docker image from a `Dockerfile`:
    *   Ensure the `Dockerfile` is correct and all necessary files are present in the build context.
    *   Verbose Ansible output might show Docker build errors.
*   **Environment Variables**: Double-check that all required environment variables (including secrets) are correctly passed to the application container. You can inspect a running container's environment variables using `sudo docker inspect <container_id_or_name>`.
*   **Port Conflicts**: Ensure the ports your application tries to use are not already in use on the server or by other Docker containers.
*   **Application-Specific Logs**: Check any log files your application writes to within its container or mounted volumes.

### 4. Caddy / Reverse Proxy Issues

*   **Caddy Logs**: Check Caddy's logs for errors related to domain validation, SSL certificate acquisition, or request proxying.
    ```bash
    # If Caddy is run as a systemd service
    sudo systemctl status caddy
    sudo journalctl -u caddy
    # If Caddy is run via Docker
    sudo docker logs <caddy_container_name>
    ```
*   **DNS Configuration**: Ensure your domain's DNS records are correctly pointing to the server's IP address.
*   **Firewall**: Make sure ports 80 and 443 are open on the server's firewall to allow HTTP and HTTPS traffic for Caddy.

### General Debugging Tips

*   **Idempotency**: Ansible is designed to be idempotent. Re-running `run()` should ideally bring the system to the desired state without adverse effects. If a run fails, you can often fix the issue and re-run it.
*   **Simplify**: If you have a complex deployment, try commenting out resources in your Hosty script to deploy a minimal setup first. Gradually add resources back to isolate the problematic component.
*   **Check Hosty's Source**: If you suspect an issue with Hosty itself or how it generates playbooks, looking at the relevant modules in `src/` (e.g., `src/instance.ts`, `src/services/`, `src/ansible/`) can provide insights.

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
