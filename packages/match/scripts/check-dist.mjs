/**
 * Post-build guard.
 *
 * 1. SIZE BUDGET  this library is intentionally tiny and dependency-free.
 *    A sudden jump means something was pulled in that should not have been.
 *
 * 2. NODE16 DECLARATION RESOLUTION  assert no emitted declaration carries an
 *    extensionless relative specifier. Those are illegal under
 *    `moduleResolution: "node16"`/"nodenext", and since nearly every consumer
 *    runs `skipLibCheck: true` the diagnostic is swallowed while resolution
 *    still fails  silently degrading the public API to `any`.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { resolve, join, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = resolve(fileURLToPath(new URL('.', import.meta.url)), '../dist')
const KB = 1024

/** Per-file ceilings in KB. */
const SIZE_BUDGETS = {
  'index.js': 12,
  'index.cjs': 12,
  'index.global.js': 12
}

function walk(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const full = join(dir, name)
    if (statSync(full).isDirectory()) out.push(...walk(full))
    else out.push(full)
  }
  return out
}

let failed = false
const files = walk(DIST)
const pad = (s, n) => String(s).padEnd(n)

console.log(
  `\n${pad('file', 20)} ${pad('size', 12)} ${pad('budget', 10)} status\n` +
    `${'-'.repeat(20)} ${'-'.repeat(12)} ${'-'.repeat(10)} ${'-'.repeat(20)}`
)
for (const [rel, limit] of Object.entries(SIZE_BUDGETS)) {
  let kb
  try {
    kb = statSync(join(DIST, rel)).size / KB
  } catch {
    console.error(`[check-dist] MISSING expected build output: ${rel}`)
    failed = true
    continue
  }
  const over = kb > limit
  if (over) failed = true
  console.log(
    `${pad(rel, 20)} ${pad(`${kb.toFixed(1)} KB`, 12)} ${pad(`${limit} KB`, 10)} ${
      over ? `OVER (+${(kb - limit).toFixed(1)} KB)` : 'ok'
    }`
  )
}

// Matches `from './x'` / `import('./x')` where the specifier has no extension.
const RELATIVE_SPECIFIER = /(?:from\s*|import\(\s*)['"](\.[^'"]*)['"]/g
const decls = files.filter((f) => /\.d\.(ts|cts|mts)$/.test(f))
const offenders = []

for (const file of decls) {
  const text = readFileSync(file, 'utf8')
  for (const [, spec] of text.matchAll(RELATIVE_SPECIFIER)) {
    if (!/\.(js|cjs|mjs)$/.test(spec)) offenders.push(`${relative(DIST, file)} -> ${spec}`)
  }
}

if (offenders.length > 0) {
  failed = true
  console.error(
    `\n[check-dist] ${offenders.length} extensionless relative specifier(s) in emitted declarations.`
  )
  console.error('[check-dist] These resolve to `any` under moduleResolution node16/nodenext:')
  for (const o of offenders.slice(0, 20)) console.error(`  ${o}`)
} else {
  console.log(
    `\n[check-dist] ${decls.length} declaration files: no extensionless relative specifiers.`
  )
}

if (failed) {
  console.error('\n[check-dist] FAILED')
  process.exit(1)
}
console.log('[check-dist] all checks passed.\n')
