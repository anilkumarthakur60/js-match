/**
 * Node + TypeScript demo of @anilkumarthakur/match.
 *
 * This imports the package by its published name, so it exercises the real
 * `exports` map and the emitted `.d.ts` — if either regresses, `pnpm build`
 * in this example fails.
 *
 * Run it with:  pnpm --filter example-playground start
 */
import { match, Matcher, UnhandledMatchError } from '@anilkumarthakur/match'

// 1. The basic PHP-style form ---------------------------------------------
const status = 'success'
console.log(
  'basic:',
  match<string, string>(status)
    .on('success', () => 'Operation successful!')
    .on('error', () => 'Something went wrong')
    .otherwise(() => 'Unknown status')
)

// 2. Matching several values at once ---------------------------------------
const describeCode = (code: number): string =>
  match<number, string>(code)
    .onAny([200, 201, 204], () => 'Success')
    .onAny([400, 401, 403, 404], () => 'Client error')
    .onAny([500, 502, 503], () => 'Server error')
    .otherwise(() => 'Unknown')

console.log('onAny:', [200, 404, 503, 999].map(describeCode).join(', '))

// 3. Predicates as guards --------------------------------------------------
const bucket = (n: number): string =>
  match<number, string>(n)
    .on(
      (v) => v < 0,
      () => 'negative'
    )
    .on(
      (v) => v === 0,
      () => 'zero'
    )
    .on(
      (v) => v < 10,
      () => 'small'
    )
    .otherwise(() => 'large')

console.log('predicates:', [-5, 0, 3, 42].map(bucket).join(', '))

// 4. `default` is an alias for `otherwise` ---------------------------------
console.log(
  'default alias:',
  match<string, string>('nope')
    .on('yes', () => 'matched')
    .default(() => 'fell through')
)

// 5. No default -> get() throws UnhandledMatchError -------------------------
// (`valueOf()` is the deprecated alias — it doubles as JS's ToPrimitive hook,
// so coercing a matcher would resolve it implicitly.)
try {
  match<string, string>('unmatched')
    .on('a', () => 'A')
    .get()
} catch (error) {
  console.log(
    'unmatched throws:',
    error instanceof UnhandledMatchError ? 'UnhandledMatchError' : 'unexpected error',
    '| subject:',
    error instanceof UnhandledMatchError ? String(error.value) : ''
  )
}

// 6. `run()` reports whether anything matched, discarding the result --------
console.log(
  'run() matched:',
  match<string, string>('b')
    .on('a', () => 'first')
    .on('b', () => 'second')
    .run()
)

// 7. The class form, for when you want to hold the matcher ------------------
const matcher = new Matcher<string, number>('two')
console.log(
  'Matcher class:',
  matcher
    .on('one', () => 1)
    .on('two', () => 2)
    .otherwise(() => 0)
)
