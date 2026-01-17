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

Handlers execute **immediately** when matched—you don't need `.otherwise()` or `.valueOf()` for side effects:

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

## Using `valueOf()`

Execute without a default handler. Throws if no match:

```typescript
import { match, UnhandledMatchError } from '@anilkumarthakur/match'

try {
  const result = match('active')
    .on('active', () => 'Active')
    .on('inactive', () => 'Inactive')
    .valueOf() // No default!

  console.log(result) // "Active"
} catch (error) {
  if (error instanceof UnhandledMatchError) {
    console.error('No match found:', error.message)
  }
}
```

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

Matches use `Object.is()` for correctness, so `NaN` matches `NaN`:

```typescript
match(NaN)
  .on(NaN, () => 'matched!')
  .otherwise(() => 'no match')
// Result: "matched!"

// And +0 !== -0
match(+0)
  .on(-0, () => 'negative zero')
  .on(+0, () => 'positive zero')
  .otherwise(() => 'default')
// Result: "positive zero"
```

## Handlers

Handlers are simple functions that return a value:

```typescript
// Simple returns
match(code)
  .on(200, () => 'OK')
  .otherwise(() => 'Error')

// Complex handlers with logic
match(user)
  .on(null, () => {
    console.log('User not found')
    return 'Anonymous'
  })
  .otherwise((u) => {
    const greeting = `Hello, ${u.name}`
    console.log(greeting)
    return greeting
  })

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
