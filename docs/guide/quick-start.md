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

Handlers execute immediately when matched—no need for `.otherwise()` for side effects:

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
const grade = match(score)
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

console.log(grade(85)) // "B"
```

### NaN-Safe Matching

Uses `Object.is()` for correct `NaN` matching:

```typescript
match(NaN)
  .on(NaN, () => 'matched NaN!')
  .otherwise(() => 'no match')
// Result: "matched NaN!"
```

## The Five Core Methods

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

### 4. `valueOf()` - Execute Without Default

Execute without a default (throws if no match):

```typescript
try {
  const result = match(value)
    .on('case1', () => 'result1')
    .valueOf()
} catch (error) {
  console.error('No match found')
}
```

### 5. `run()` - Side Effects Only

Return boolean indicating if a match occurred:

```typescript
const didMatch = match(action)
  .on('save', () => saveData())
  .on('delete', () => deleteData())
  .run() // true if matched, false otherwise
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
