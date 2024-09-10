export function unindent(text: string) {
  const lines = text.trim().split(`\n`)
  const indents = lines.map((line) => {
    let i = 0
    while (i < line.length && line.charAt(i) === ' ') i++
    return i
  })
  const minIndent = indents.reduce((res, x) => Math.min(res, x), indents[0])
  return lines.map((line) => line.slice(minIndent)).join(`\n`) + `\n`
}
