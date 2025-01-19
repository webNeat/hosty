import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

type FileData = {
  server_caddyfile: {
    log_path: string
    service_caddyfiles_pattern: string
  }
  service_caddyfile: {
    domain: string
    local_urls: string
  }
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const files_dir = path.join(__dirname, 'files')

export function get_file<Name extends keyof FileData>(name: Name, data: FileData[Name]) {
  let content = fs.readFileSync(path.join(files_dir, name), 'utf-8')
  for (const [key, value] of Object.entries(data)) {
    content = content.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value)
  }
  return content
}
