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
- `value`: The value to compare using strict equality (===)
- `result`: What to return if matched
- `defaultResult`: What to return if nothing matches

## Using `on()`

Add individual cases with `.on()`:

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

## Using `onAny()`

Match multiple values to the same handler:

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

Both methods do the same thing - set a default and execute:

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

## Method Chaining

All methods return `this` for chaining (except `otherwise()`, `default()`, and `valueOf()` which execute):

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
    .otherwise(() => 'matched something else')
}
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

// Async handlers (results are awaited by caller)
match(status)
  .on('loading', async () => {
    const data = await fetchData()
    return data
  })
  .otherwise(async () => {
    return 'No data'
  })
```

## Next Steps

- [Advanced Patterns](/guide/advanced-patterns) - Nested matching, composition, etc.
- [Type Safety](/guide/type-safety) - Leverage TypeScript fully
- [Examples](/examples/) - See real-world use cases
