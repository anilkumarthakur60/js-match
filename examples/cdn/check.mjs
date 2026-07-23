/**
 * Smoke-test for the browser/CDN global build.
 *
 * The HTML demo cannot run in CI, so this loads the exact same bundle in a
 * bare sandbox — no Node globals — and asserts the global is exposed and
 * behaves. Anything the bundle needed beyond standard JS would fail here
 * rather than silently working in Node and breaking in a real browser.
 *
 * Run: pnpm --filter example-cdn build
 */
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { resolve, dirname } from 'node:path'
import { createContext, runInContext } from 'node:vm'
import assert from 'node:assert/strict'

const here = dirname(fileURLToPath(import.meta.url))
const bundlePath = resolve(here, '../../packages/match/dist/index.global.js')

let code
try {
  code = readFileSync(bundlePath, 'utf8')
} catch {
  console.error(`[cdn] Global bundle not found at ${bundlePath}`)
  console.error('[cdn] Build the library first: pnpm build')
  process.exit(1)
}

const sandbox = { console }
createContext(sandbox)
runInContext(code, sandbox)

const JsMatch = sandbox.JsMatch
assert.ok(JsMatch, 'global `JsMatch` was not defined by the bundle')

for (const name of ['match', 'Matcher', 'UnhandledMatchError']) {
  assert.equal(typeof JsMatch[name] !== 'undefined', true, `JsMatch.${name} is missing`)
}

const { match, UnhandledMatchError } = JsMatch

assert.equal(
  match('success')
    .on('success', () => 'ok')
    .otherwise(() => 'nope'),
  'ok',
  'basic on/otherwise should match'
)

assert.equal(
  match(404)
    .onAny([200, 201], () => 'success')
    .onAny([400, 404], () => 'client error')
    .otherwise(() => 'unknown'),
  'client error',
  'onAny should match'
)

assert.equal(
  match(7)
    .on(
      (v) => v > 5,
      () => 'big'
    )
    .otherwise(() => 'small'),
  'big',
  'predicate guards should match'
)

assert.throws(
  () =>
    match('unmatched')
      .on('a', () => 'A')
      .valueOf(),
  (err) => err instanceof UnhandledMatchError,
  'an unmatched valueOf() should throw UnhandledMatchError'
)

const sizeKb = (Buffer.byteLength(code) / 1024).toFixed(1)
console.log(`[cdn] OK — global build works (JsMatch, ${sizeKb} KB).`)
