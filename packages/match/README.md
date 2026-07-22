# @anilkumarthakur/match

[![npm version](https://img.shields.io/npm/v/@anilkumarthakur/match)](https://www.npmjs.com/package/@anilkumarthakur/match)
[![license](https://img.shields.io/npm/l/@anilkumarthakur/match)](LICENSE)
[![CI](https://github.com/anilkumarthakur60/js-match/actions/workflows/ci.yml/badge.svg)](https://github.com/anilkumarthakur60/js-match/actions/workflows/ci.yml)
[![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](#testing)

PHP-style match expressions for JavaScript/TypeScript with 100% type safety and comprehensive test coverage.

`@anilkumarthakur/match` brings the power and elegance of PHP's match expression to the JavaScript/TypeScript world. It provides a clean, type-safe alternative to complex switch statements and nested if-else logic.

## Features

✨ **Type-Safe**: Full TypeScript support with generic types for subject and result  
🎯 **Readable**: Clean, expressive syntax inspired by PHP match expressions  
🚀 **Fast**: Eager, allocation-free matching — a single `Object.is` per case, no lookup table to build  
🛡️ **Guards**: Predicate functions, not just literals — the headline extension over PHP's `match`  
📦 **Lightweight**: Zero dependencies, ~1 KB gzipped (ES module)  
🧪 **Well-Tested**: Comprehensive test suite at 100% code coverage  
🔗 **Chainable**: Fluent API for method chaining  
🌍 **Cross-Platform**: Works in Node.js and browsers (ESM + CJS + IIFE browser global)

## Installation

### npm

```bash
npm install @anilkumarthakur/match
```

### yarn

```bash
yarn add @anilkumarthakur/match
```

### bun

```bash
bun add @anilkumarthakur/match
```

### CDN (browser global)

`unpkg` and `jsDelivr` resolve the bare package specifier to `dist/index.global.js`, an IIFE bundle
that exposes everything on the `JsMatch` global. There is no UMD build — the bundle performs no
AMD/CommonJS detection.

```html
<script src="https://unpkg.com/@anilkumarthakur/match"></script>
<script>
  const { match } = JsMatch
  console.log(
    match(404)
      .on(404, () => 'Not Found')
      .otherwise(() => 'Unknown')
  ) // "Not Found"
</script>
```

## Quick Start

```typescript
import { match } from '@anilkumarthakur/match'

const result = match('success')
  .on('success', () => 'Operation successful!')
  .on('error', () => 'Something went wrong')
  .otherwise(() => 'Unknown status')

console.log(result) // "Operation successful!"
```

## API Reference

### `match<TSubject, TResult>(subject: TSubject): Matcher`

Creates a new match expression for the given subject value.

**Parameters:**

- `subject` - The value to match against (any type)

**Returns:** A `Matcher` instance for method chaining

**Example:**

```typescript
const matcher = match(statusCode)
```

### `on(pattern: TSubject | Predicate<TSubject>, handler: () => TResult): Matcher`

Adds a case. `pattern` is either a literal value compared with `Object.is()`, or a predicate
function `(subject) => boolean` (see [Predicate Matching](#predicate-matching)).

**Parameters:**

- `pattern` - A literal value, or a predicate function receiving the subject
- `handler` - Function returning the result if matched

**Returns:** The matcher instance (for chaining)

**Example:**

```typescript
match(status)
  .on(200, () => 'Success')
  .on(404, () => 'Not Found')
```

### `onAny(values: readonly TSubject[], handler: () => TResult): Matcher`

Adds multiple values that all map to the same handler (simulates PHP's comma-separated cases).

**Parameters:**

- `values` - Array of values to match
- `handler` - Function to execute if any value matches

**Returns:** The matcher instance (for chaining)

**Example:**

```typescript
match(status)
  .onAny([200, 201, 202], () => 'Success')
  .onAny([400, 401, 403], () => 'Client Error')
```

### `otherwise(handler: () => TResult): TResult`

Sets the default handler and executes the match. Returns immediately with the result.

**Parameters:**

- `handler` - Function to execute if no cases match

**Returns:** The result from matched handler or default handler

**Throws:** `UnhandledMatchError` if no match found and no default provided

**Example:**

```typescript
const result = match(value)
  .on('expected', () => 'matched')
  .otherwise(() => 'default')
```

### `default(handler: () => TResult): TResult`

PHP-compatible alias for `otherwise()`. Identical behavior.

**Example:**

```typescript
const result = match(value)
  .on('expected', () => 'matched')
  .default(() => 'default')
```

### `get(): TResult`

Returns the matched result without a default handler. Throws if nothing matched.

**Returns:** The result from the matched handler

**Throws:** `UnhandledMatchError` if no match found

**Example:**

```typescript
const result = match('test')
  .on('test', () => 'matched')
  .get() // Must have matched something
```

### `valueOf(): TResult`

Deprecated alias for [`get()`](#get-tresult). Prefer `get()`.

`valueOf` is JavaScript's own `ToPrimitive` hook, so the engine calls it implicitly whenever a
matcher is coerced — string concatenation, `==`, arithmetic. On an unmatched chain that means an
`UnhandledMatchError` can surface from an expression that never mentions `valueOf`:

```typescript
const matcher = match(1).on(2, () => 'two')
matcher + '' // throws UnhandledMatchError: Unhandled match value: 1
```

`get()` has no such coupling to the language.

### `run(): boolean`

Executes the chain for side effects only and reports whether anything matched. Handlers have
already run by this point (matching is eager), so this is just the terminal that gives you the
boolean instead of a value.

**Returns:** `true` if a case matched, `false` otherwise

**Example:**

```typescript
const handled = match(action)
  .on('save', () => saveData())
  .on('delete', () => deleteData())
  .run()

if (!handled) console.warn(`Unknown action: ${action}`)
```

### `isMatched: boolean`

Read-only getter for the current match state. Unlike `run()` it does not terminate the chain, so
you can inspect a matcher and keep adding cases.

**Example:**

```typescript
const matcher = match('test').on('test', () => 'matched')
console.log(matcher.isMatched) // true
```

### `UnhandledMatchError`

Custom error thrown when no case matches and no default handler is provided.

**Properties:**

- `name` - "UnhandledMatchError"
- `message` - Contains the unmatched value

**Example:**

```typescript
try {
  match('foo')
    .on('bar', () => 'bar')
    .get()
} catch (error) {
  if (error instanceof UnhandledMatchError) {
    console.error('No match found for:', error.message)
  }
}
```

## Usage Examples

### Predicate Matching

Beyond PHP: any `on()` pattern may be a function, in which case it is called with the subject and
matches when it returns truthy.

```typescript
const grade = (score: number): string => {
  return match(score)
    .on(
      (n) => n >= 90,
      () => 'A'
    )
    .on(
      (n) => n >= 80,
      () => 'B'
    )
    .on(
      (n) => n >= 70,
      () => 'C'
    )
    .otherwise(() => 'F')
}

console.log(grade(95)) // "A"
console.log(grade(85)) // "B"
console.log(grade(45)) // "F"
```

Literals and predicates mix freely in one chain — first match wins either way:

```typescript
const describe = (score: number | string): string => {
  return match(score)
    .on('N/A', () => 'Not available')
    .on(
      (v) => typeof v === 'number' && v > 80,
      () => 'High'
    )
    .otherwise(() => 'Low')
}

console.log(describe('N/A')) // "Not available"
console.log(describe(90)) // "High"
console.log(describe(60)) // "Low"
```

> **A function subject disables predicate matching.** When the subject is itself a function, `on()`
> compares patterns by reference instead of calling them — otherwise you could never match a
> function value literally. The predicate is silently never invoked and the case just falls
> through, with no error. See [Supported Types](#supported-types).

### Basic String Matching

```typescript
import { match } from '@anilkumarthakur/match'

const getRole = (role: string) => {
  return match(role)
    .on('admin', () => 'Full access')
    .on('user', () => 'Limited access')
    .on('guest', () => 'Read-only access')
    .otherwise(() => 'Unknown role')
}

console.log(getRole('admin')) // "Full access"
```

### Number Matching (HTTP Status Codes)

```typescript
const handleResponse = (statusCode: number) => {
  return match(statusCode)
    .on(200, () => 'OK')
    .onAny([201, 202, 204], () => 'Created/Accepted')
    .on(400, () => 'Bad Request')
    .on(401, () => 'Unauthorized')
    .on(404, () => 'Not Found')
    .on(500, () => 'Server Error')
    .otherwise(() => 'Unknown Status')
}

console.log(handleResponse(200)) // "OK"
console.log(handleResponse(201)) // "Created/Accepted"
console.log(handleResponse(999)) // "Unknown Status"
```

### Complex Notifications

```typescript
const showNotification = (type: string, message: string) => {
  const styling = match(type)
    .on('success', () => ({ color: 'green', icon: '✓' }))
    .on('error', () => ({ color: 'red', icon: '✗' }))
    .on('warning', () => ({ color: 'orange', icon: '⚠' }))
    .on('info', () => ({ color: 'blue', icon: 'ℹ' }))
    .otherwise(() => ({ color: 'gray', icon: '•' }))

  return `[${styling.icon}] ${message}`
}

console.log(showNotification('success', 'Saved!')) // "[✓] Saved!"
console.log(showNotification('error', 'Failed!')) // "[✗] Failed!"
```

### Nested Match Expressions

```typescript
const getUserStatus = (userId: string, status: string) => {
  return match(userId)
    .on('admin', () => {
      return match(status)
        .on('active', () => 'Admin is active')
        .on('inactive', () => 'Admin is inactive')
        .otherwise(() => 'Admin status unknown')
    })
    .on('user', () => {
      return match(status)
        .on('active', () => 'User is active')
        .otherwise(() => 'User is inactive')
    })
    .otherwise(() => 'User not found')
}

console.log(getUserStatus('admin', 'active')) // "Admin is active"
console.log(getUserStatus('user', 'active')) // "User is active"
console.log(getUserStatus('guest', 'active')) // "User not found"
```

### Type-Safe Unions

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const getLogColor = (level: LogLevel): string => {
  return match(level)
    .on('debug', () => 'gray')
    .on('info', () => 'blue')
    .on('warn', () => 'yellow')
    .on('error', () => 'red')
    .otherwise(() => 'white')
}

console.log(getLogColor('info')) // "blue"
```

### Conditional Logic with match(true)

```typescript
const getUserMessage = (age: number, isPremium: boolean) => {
  return match(true)
    .on(age < 13, () => 'Not eligible')
    .on(age >= 13 && age < 18, () => 'Teen user')
    .on(age >= 18 && !isPremium, () => 'Free user')
    .on(age >= 18 && isPremium, () => 'Premium user')
    .otherwise(() => 'Unknown')
}

console.log(getUserMessage(25, true)) // "Premium user"
console.log(getUserMessage(16, false)) // "Teen user"
```

### Days in Month (Real-World Example)

```typescript
const daysInMonth = (month: string, year: number): number => {
  const isLeap = (y: number) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)

  return match(month.toLowerCase().slice(0, 3))
    .on('jan', () => 31)
    .on('feb', () => (isLeap(year) ? 29 : 28))
    .on('mar', () => 31)
    .on('apr', () => 30)
    .on('may', () => 31)
    .on('jun', () => 30)
    .on('jul', () => 31)
    .on('aug', () => 31)
    .on('sep', () => 30)
    .on('oct', () => 31)
    .on('nov', () => 30)
    .on('dec', () => 31)
    .otherwise(() => {
      throw new Error('Invalid month')
    })
}

console.log(daysInMonth('February', 2024)) // 29 (leap year)
console.log(daysInMonth('February', 2025)) // 28
```

## Comparison with PHP match()

### PHP

```php
$result = match($status) {
    'success', 'ok' => 'All good',
    'error', 'fail' => 'Something went wrong',
    default => 'Unknown'
};
```

### JavaScript (this library)

```typescript
const result = match(status)
  .onAny(['success', 'ok'], () => 'All good')
  .onAny(['error', 'fail'], () => 'Something went wrong')
  .otherwise(() => 'Unknown')
```

## Supported Types

The library supports matching on any JavaScript type. Literal comparison uses `Object.is()`, **not**
`===`:

- ✅ Strings
- ✅ Numbers (including `Infinity`, `-Infinity`, `NaN`)
- ✅ Booleans
- ✅ null / undefined
- ✅ Symbols
- ✅ BigInt
- ✅ Objects (by reference)
- ✅ Arrays (by reference)
- ✅ Functions (by reference)
- ✅ Enums
- ✅ Class instances (by reference)

### `Object.is()`, not `===`

The two operators diverge on exactly two values, and the difference is deliberate:

```typescript
// NaN matches NaN — `NaN === NaN` is false, `Object.is(NaN, NaN)` is true
match(NaN)
  .on(NaN, () => 'matched NaN')
  .otherwise(() => 'no match') // → "matched NaN"

// +0 and -0 are distinct — `+0 === -0` is true, `Object.is(+0, -0)` is false
match(+0)
  .on(-0, () => 'negative zero')
  .on(+0, () => 'positive zero')
  .otherwise(() => 'default') // → "positive zero"
```

`onAny()` uses `Object.is()` per element, so the same rules apply there.

### Function subjects

Because functions are matched by reference, a function-valued subject turns off predicate matching
for the whole chain — the pattern is compared to the subject rather than called:

```typescript
const fn = () => 'subject'

match(fn)
  .on(
    (v) => true,
    () => 'predicate ran'
  ) // never invoked
  .otherwise(() => 'fell through') // → "fell through"

match(fn)
  .on(fn, () => 'matched by reference')
  .otherwise(() => 'no match') // → "matched by reference"
```

There is no error or warning — the case simply does not fire. If you need guards over a function
value, match on something else (`match(true)` with boolean conditions, or a derived key).

## Type Safety

Full TypeScript support with automatic type inference:

```typescript
// Explicit types
const result = match<string, number>('test')
  .on('test', () => 123)
  .otherwise(() => 456)

// Inferred types
const result2 = match('test')
  .on('test', () => 'result') // Inferred as string result
  .otherwise(() => 'default')

// Union types
type Status = 'success' | 'pending' | 'error'
const result3 = match<Status, string>('success')
  .on('success', () => 'Done')
  .on('pending', () => 'In progress')
  .on('error', () => 'Failed')
  .otherwise(() => 'Unknown')
```

## Performance

- ⚡ Sequential `Object.is()` scan — O(N) in the number of cases, with no `Map` and no lookup table
  to allocate. Eager chaining is what makes that inherent: a handler must be able to run the moment
  its `.on()` is evaluated, so there is nothing to index ahead of time. For the case counts a
  `match` expression realistically has, a few identity comparisons beat building a hash map.
- 💾 Only the first matching handler executes; later `.on()` calls short-circuit to no-ops
- 📦 Roughly 3 kB raw / 1 kB gzipped per format (ESM, CJS, IIFE)

## Testing

The library ships a comprehensive test suite at 100% code coverage:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

Test categories:

- Basic functionality
- Type matching (strings, numbers, booleans, objects, arrays, etc.)
- All API methods (`on`, `onAny`, `otherwise`, `default`, `get`/`valueOf`, `run`, `isMatched`)
- Predicate matching and function subjects
- Error handling
- Type safety
- Real-world examples
- Edge cases and performance

## Browser Support

Works in all modern browsers. The published `engines.node` range is `>=22`, and the build targets
ES2022. The Node floor follows the LTS schedule — it is the oldest LTS line still in maintenance and
rises as older lines reach end-of-life — so the supported runtimes are:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Node.js 22+ (active LTS lines)

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development

This is a pnpm workspace; run these from the repository root.

```bash
# Install dependencies
pnpm install

# Run tests
pnpm run test

# Build
pnpm run build

# Lint and format
pnpm run lint
pnpm run format

# Typecheck + lint + format:check + test, in one shot
pnpm run verify
```

## License

MIT - See [LICENSE](LICENSE) for details

## Author

[Anil Kumar Thakur](https://github.com/anilkumarthakur60)

## Related

- [PHP match expression](https://www.php.net/manual/en/control-structures.match.php) - Official PHP documentation
- [JavaScript switch statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history and updates.
