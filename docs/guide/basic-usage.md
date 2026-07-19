# Basic Usage

## The Match Pattern

The basic pattern is:

```typescript
match(subject)
  .on(value, () => result)
  .otherwise(() => defaultResult)
```

Where:

- `subject`: The value to match against
- `value`: The value to compare using `Object.is()`, OR a predicate function `(val) => boolean`
- `result`: What to return if matched
- `defaultResult`: What to return if nothing matches

## Eager Execution

Handlers execute **immediately** when matched—you don't need `.otherwise()` or `.get()` for side effects:

```typescript
import { match } from '@anilkumarthakur/match'

let tab = 'hero'

match('team-section')
  .on('hero-section', () => {
    tab = 'hero'
  })
  .on('team-section', () => {
    tab = 'team'
  })
// tab is now 'team' - handler executed immediately!

console.log(tab) // "team"
```

This is especially useful in Vue and React for reactive state updates.

## Literal Matching with `on()`

Match specific values:

```typescript
import { match } from '@anilkumarthakur/match'

const getUserRole = (role: string): string => {
  return match(role)
    .on('admin', () => 'Full access')
    .on('user', () => 'Limited access')
    .on('guest', () => 'Read-only access')
    .otherwise(() => 'Unknown role')
}

console.log(getUserRole('admin')) // "Full access"
console.log(getUserRole('unknown')) // "Unknown role"
```

## Predicate/Guard Matching

Use functions for flexible conditional logic (JS extension beyond PHP):

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
```

Predicates enable:

- Range matching: `(n) => n > 5`
- Type checking: `(v) => typeof v === 'string'`
- Complex logic: `(obj) => obj.role === 'admin' && obj.active`

## Using `onAny()`

Match multiple literal values to the same handler:

```typescript
const getStatusCategory = (code: number): string => {
  return match(code)
    .onAny([200, 201, 202, 204], () => 'Success')
    .onAny([301, 302, 303, 307], () => 'Redirect')
    .onAny([400, 401, 403, 404], () => 'Client Error')
    .on(500, () => 'Server Error')
    .otherwise(() => 'Unknown')
}

console.log(getStatusCategory(200)) // "Success"
console.log(getStatusCategory(301)) // "Redirect"
console.log(getStatusCategory(999)) // "Unknown"
```

## Using `otherwise()` and `default()`

Both methods set a default and execute:

```typescript
// Using otherwise()
const result1 = match(value)
  .on('case1', () => 'result1')
  .otherwise(() => 'default')

// Using default() (PHP-style)
const result2 = match(value)
  .on('case1', () => 'result1')
  .default(() => 'default')
```

## Using `get()`

Resolve without a default handler. Throws `UnhandledMatchError` if nothing matched:

```typescript
import { match, UnhandledMatchError } from '@anilkumarthakur/match'

try {
  const result = match('active')
    .on('active', () => 'Active')
    .on('inactive', () => 'Inactive')
    .get() // No default!

  console.log(result) // "Active"
} catch (error) {
  if (error instanceof UnhandledMatchError) {
    // `error.value` is the raw subject; the message is lossy for exotic values
    console.error('No match found for:', error.value)
  }
}
```

### `valueOf()` is a deprecated alias

`valueOf()` does the same thing, but `valueOf` is JavaScript's own `ToPrimitive` hook, so the
engine calls it on _any_ implicit coercion — string concatenation, `==`, arithmetic, a sort
comparator. On an unmatched chain that makes `UnhandledMatchError` surface from an expression that
never mentions the method:

```typescript
const matcher = match(1).on(2, () => 'two')
matcher + '' // throws UnhandledMatchError: Unhandled match value: 1
```

`get()` has no such coupling to the language. Prefer it.

## Using `run()`

Return a boolean indicating if a match occurred. Useful for side-effect-only patterns:

```typescript
const didMatch = match(action)
  .on('save', () => saveData())
  .on('delete', () => deleteData())
  .on('refresh', () => refreshUI())
  .run()

if (didMatch) {
  console.log('Action handled')
} else {
  console.log('Unknown action')
}
```

## Using `isMatched`

A read-only getter for the same state. Unlike `run()` it does not terminate the chain, so you can
inspect a matcher and keep adding cases:

```typescript
const matcher = match('test').on('test', () => 'matched')
console.log(matcher.isMatched) // true

const unmatched = match('other').on('test', () => 'matched')
console.log(unmatched.isMatched) // false
```

## Method Chaining

Chain `.on()` calls (all return `this`):

```typescript
const result = match(status)
  .on('pending', () => 'Loading...')
  .on('success', () => 'Done!')
  .on('error', () => 'Failed!')
  .on('cancelled', () => 'Cancelled')
  .otherwise(() => 'Unknown')
```

## Supported Types

You can match on any JavaScript type:

```typescript
const matcher = (value: unknown) => {
  return match(value)
    .on('string', () => 'matched string')
    .on(42, () => 'matched number')
    .on(true, () => 'matched boolean')
    .on(null, () => 'matched null')
    .on(undefined, () => 'matched undefined')
    .on(NaN, () => 'matched NaN')
    .otherwise(() => 'matched something else')
}
```

## Object.is() Semantics

Literal comparison uses `Object.is()`, **not** `===`. The two diverge on exactly two values, and
both differences are deliberate:

```typescript
// NaN matches NaN — `NaN === NaN` is false, `Object.is(NaN, NaN)` is true
match(NaN)
  .on(NaN, () => 'matched!')
  .otherwise(() => 'no match')
// Result: "matched!"

// +0 and -0 are distinct — `+0 === -0` is true, `Object.is(+0, -0)` is false
match(+0)
  .on(-0, () => 'negative zero')
  .on(+0, () => 'positive zero')
  .otherwise(() => 'default')
// Result: "positive zero"
```

`onAny()` applies `Object.is()` to each element, so the same rules hold there:

```typescript
match(NaN)
  .onAny([1, NaN, 3], () => 'matched in list')
  .otherwise(() => 'no match')
// Result: "matched in list"
```

## Function Subjects

Functions are matched by reference, which means a function-valued subject switches predicate
matching **off** for the whole chain — the pattern is compared to the subject instead of being
called:

```typescript
const fn = () => 'subject'

match(fn)
  .on(
    (v) => true,
    () => 'predicate ran'
  ) // never invoked
  .otherwise(() => 'fell through')
// Result: "fell through"

match(fn)
  .on(fn, () => 'matched by reference')
  .otherwise(() => 'no match')
// Result: "matched by reference"
```

This is the only way a function value could stay matchable literally, but the failure mode is quiet:
no error, the case simply does not fire. In TypeScript the `Pattern<TSubject>` type withdraws the
predicate arm when the subject type is a function, so the mistake is a compile error — but plain
JavaScript, and subjects whose declared type is a _union_ containing a function, get no warning.

If you need guards over a function value, match on something else: `match(true)` with boolean
conditions, or a derived key such as `fn.name`.

## Handlers

Handlers are simple functions that return a value:

```typescript
// Simple returns
match(code)
  .on(200, () => 'OK')
  .otherwise(() => 'Error')

// Complex handlers with logic.
// Handlers take NO arguments — `Handler<T>` is `() => T`, and every handler is
// invoked with zero arguments, including the one passed to otherwise(). Close
// over the subject rather than declaring a parameter for it.
match(user)
  .on(null, () => {
    console.log('User not found')
    return 'Anonymous'
  })
  .otherwise(() => {
    const greeting = `Hello, ${user.name}`
    console.log(greeting)
    return greeting
  })
// with user = { name: 'Ada' } this logs and returns "Hello, Ada"

// Async handlers
match(status)
  .on('loading', async () => {
    const data = await fetchData()
    return data
  })
  .otherwise(async () => {
    return 'No data'
  })
```

## First Match Wins

Once a match is found, subsequent `.on()` calls are ignored:

```typescript
let calls = 0
match('x')
  .on('x', () => {
    calls++
  })
  .on('x', () => {
    calls++
  }) // ignored
  .otherwise(() => {})

console.log(calls) // 1
```

## Next Steps

- [Advanced Patterns](/guide/advanced-patterns) - Nested matching, composition, etc.
- [Type Safety](/guide/type-safety) - Leverage TypeScript fully
- [Examples](/examples/) - See real-world use cases
