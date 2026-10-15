/**
 * Renames the project: package scope, display name and database names.
 *
 *   bun run rename my-app
 *   bun run rename my-app --title "My App"
 *   bun run rename my-app --dry-run
 *
 * The current name is read from package.json, so it can be run again later.
 */
import { execFileSync } from 'node:child_process'
import { readFileSync, writeFileSync } from 'node:fs'
import { parseArgs } from 'node:util'

const { values, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    title: { type: 'string' },
    'dry-run': { type: 'boolean', default: false },
    help: { type: 'boolean', short: 'h', default: false },
  },
})

const USAGE = `Usage: bun run rename <name> [--title "Display Name"] [--dry-run]

  <name>     lowercase letters, digits and dashes, e.g. my-app
  --title    what people see, e.g. "My App" (default: from <name>)
  --dry-run  list what would change, change nothing`

const slug = positionals[0]
if (values.help || !slug) {
  console.log(USAGE)
  process.exit(values.help ? 0 : 1)
}
if (!/^[a-z][a-z0-9]*(-[a-z0-9]+)*$/.test(slug)) {
  console.error(`"${slug}" is not a valid name: use lowercase letters, digits and dashes.\n`)
  console.error(USAGE)
  process.exit(1)
}

/** my-app → My App */
const titleOf = (name: string) =>
  name
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

/** my-app → my_app (a valid unquoted Postgres identifier) */
const snakeOf = (name: string) => name.replaceAll('-', '_')

const root = new URL('../', import.meta.url)
const pkg = JSON.parse(readFileSync(new URL('package.json', root), 'utf8')) as {
  name: string
  displayName?: string
}

const from = {
  slug: pkg.name,
  title: pkg.displayName ?? titleOf(pkg.name),
  snake: snakeOf(pkg.name),
}
const to = { slug, title: values.title ?? titleOf(slug), snake: snakeOf(slug) }

if (from.slug === to.slug && from.title === to.title) {
  console.log(`Already called ${to.slug} ("${to.title}"). Nothing to do.`)
  process.exit(0)
}

/** Lines between these markers describe the template itself, and go on the first rename. */
const TEMPLATE_BLOCK = /\n<!-- template:start -->[\s\S]*?<!-- template:end -->\n/g

function rename(text: string): string {
  return text
    .replace(TEMPLATE_BLOCK, '')
    .replaceAll(from.slug, to.slug)
    .replaceAll(from.snake, to.snake)
    .replaceAll(from.title, to.title)
}

// Every file git knows about or would add: tracked, plus new files not ignored.
const files = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard'], {
  cwd: root,
  encoding: 'utf8',
})
  .split('\n')
  // Not the lockfile (bun install rewrites it) and not this script, whose own
  // template-block pattern would match itself.
  .filter((file) => file && file !== 'bun.lock' && file !== 'scripts/rename.ts')

const changed: string[] = []
for (const file of files) {
  const url = new URL(file, root)
  let text: string
  try {
    text = readFileSync(url, 'utf8')
  } catch {
    continue // listed but deleted
  }
  if (text.includes('\0')) continue // binary
  const next = rename(text)
  if (next === text) continue
  changed.push(file)
  if (!values['dry-run']) writeFileSync(url, next)
}

console.log(
  `${values['dry-run'] ? 'Would rename' : 'Renamed'} ${from.slug} → ${to.slug}, ` +
    `"${from.title}" → "${to.title}", ${from.snake} → ${to.snake} in ${changed.length} files:`,
)
for (const file of changed) console.log(`  ${file}`)

if (values['dry-run']) process.exit(0)

// Relink the workspace packages under their new names and refresh the lockfile.
execFileSync('bun', ['install'], { cwd: root, stdio: 'inherit' })

// A new scope can sort differently from the old one, so re-sort imports and reformat.
execFileSync(
  'bunx',
  [
    'biome',
    'check',
    '--write',
    '--no-errors-on-unmatched',
    '--files-ignore-unknown=true',
    ...changed,
  ],
  { cwd: root, stdio: 'inherit' },
)

console.log(`
Done. Next:
  - If you already ran \`bun db:up\`, the database still has the old name.
    Reset it with \`docker compose down -v && bun db:up && bun db:migrate\`.
  - If you have a .env, update DATABASE_URL to match .env.example.
  - Review the changes with \`git diff\`.`)
