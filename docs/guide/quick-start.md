# Quick Start

Get up and running with @anilkumarthakur/match in 5 minutes!

## Basic Example

```typescript
import { match } from '@anilkumarthakur/match'

const result = match('success')
  .on('success', () => 'Operation successful!')
  .on('error', () => 'Something went wrong')
  .otherwise(() => 'Unknown status')

console.log(result) // "Operation successful!"
```

## Key Features

### Eager Execution

Handlers execute immediately when matchedno need for `.otherwise()` for side effects:

```typescript
let status = 'pending'

match('completed')
  .on('completed', () => {
    status = 'done'
  })
  .on('error', () => {
    status = 'failed'
  })
// status is now 'done' - handler executed immediately!

console.log(status) // "done"
```

### Predicate/Guard Matching

Use functions for flexible conditional logic:

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

::: warning A function subject turns predicates off
When the subject is itself a function, patterns are compared by reference instead of being called 
otherwise a function value could never be matched literally. The predicate is silently never
invoked and the case just falls through, with no error. TypeScript withdraws the predicate arm for
function subjects, but in plain JavaScript nothing warns you. See
[Function subjects](/guide/basic-usage#function-subjects).
:::

### `Object.is()`, not `===`

Matching uses `Object.is()`, which diverges from `===` on exactly two values:

```typescript
// NaN matches NaN  `NaN === NaN` would be false
match(NaN)
  .on(NaN, () => 'matched NaN!')
  .otherwise(() => 'no match')
// Result: "matched NaN!"

// +0 and -0 are distinct  `+0 === -0` would be true
match(+0)
  .on(-0, () => 'negative zero')
  .on(+0, () => 'positive zero')
  .otherwise(() => 'default')
// Result: "positive zero"
```

## The Core Methods

### 1. `on()` - Single Case or Predicate

Match a literal value or use a predicate function:

```typescript
match(status)
  .on('active', () => 'Active') // literal
  .on(
    (s) => s.includes('error'),
    () => 'Error'
  ) // predicate
```

### 2. `onAny()` - Multiple Cases

Match multiple values to the same handler:

```typescript
match(code)
  .onAny([200, 201, 202], () => 'Success')
  .onAny([400, 401, 403], () => 'Client Error')
```

### 3. `otherwise()` / `default()` - Default Handler

Set a fallback handler and execute:

```typescript
const result = match(value)
  .on('case1', () => 'result1')
  .otherwise(() => 'default result')
```

### 4. `get()` - Resolve Without a Default

Return the matched result with no fallback. Throws `UnhandledMatchError` if nothing matched:

```typescript
import { match, UnhandledMatchError } from '@anilkumarthakur/match'

try {
  const result = match(value)
    .on('case1', () => 'result1')
    .get()
} catch (error) {
  if (error instanceof UnhandledMatchError) {
    console.error('No match for', error.value)
  }
}
```

`valueOf()` is a deprecated alias for `get()`. Prefer `get()`: `valueOf` is JavaScript's own
`ToPrimitive` hook, so the engine calls it on any implicit coercion, and an unmatched chain will
then throw from an expression that never mentions the method.

```typescript
const matcher = match(1).on(2, () => 'two')
matcher + '' // throws UnhandledMatchError: Unhandled match value: 1
```

### 5. `run()` - Side Effects Only

Return a boolean indicating if a match occurred:

```typescript
const didMatch = match(action)
  .on('save', () => saveData())
  .on('delete', () => deleteData())
  .run() // true if matched, false otherwise
```

### 6. `isMatched` - Inspect Without Terminating

A read-only getter, so unlike `run()` it does not end the chain:

```typescript
const matcher = match('test').on('test', () => 'matched')
console.log(matcher.isMatched) // true
```

## Complete Example

Here's a practical example with multiple features:

```typescript
import { match } from '@anilkumarthakur/match'

interface Request {
  method: string
  path: string
}

interface Response {
  status: number
  message: string
}

const handleRequest = (request: Request): Response => {
  return match(request.method)
    .on('GET', () => ({ status: 200, message: 'Retrieved' }))
    .on('POST', () => ({ status: 201, message: 'Created' }))
    .on('PUT', () => ({ status: 200, message: 'Updated' }))
    .on('DELETE', () => ({ status: 204, message: 'Deleted' }))
    .otherwise(() => ({ status: 405, message: 'Method not allowed' }))
}

const response = handleRequest({ method: 'GET', path: '/users' })
console.log(response) // { status: 200, message: 'Retrieved' }
```

## Next Steps

- [Basic Usage](/guide/basic-usage) - Learn all the concepts
- [Advanced Patterns](/guide/advanced-patterns) - Master advanced techniques
- [Examples](/examples/) - See real-world use cases
