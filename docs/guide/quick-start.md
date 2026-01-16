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

## The Four Methods

### 1. `on()` - Single Case

Add a case to match against:

```typescript
match(status)
  .on('active', () => 'User is active')
  .on('inactive', () => 'User is inactive')
```

### 2. `onAny()` - Multiple Cases

Match multiple values to the same handler:

```typescript
match(code)
  .onAny([200, 201, 202], () => 'Success')
  .onAny([400, 401, 403], () => 'Client Error')
```

### 3. `otherwise()` / `default()` - Default Handler

Set a default handler and execute:

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
    .valueOf() // Must have a match!
} catch (error) {
  console.error('No match found')
}
```

## Complete Example

Here's a more practical example:

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
