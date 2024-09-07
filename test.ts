import { glob } from 'zx'
import { run } from './tests/utils/index.js'

let filenames = process.argv.slice(2)
filenames = filenames.map((filename) => {
  if (!filename.startsWith('./')) filename = './' + filename
  return filename
})
if (filenames.length === 0) {
  filenames = await glob('./tests/*.test.ts')
}

for (const filename of filenames) {
  await import(filename)
}

run()
