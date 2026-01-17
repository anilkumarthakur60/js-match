# Examples

Practical examples showing how to use @anilkumarthakur/match.

## Quick Examples

### String Matching

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

### Number Matching

```typescript
const getStatus = (code: number) => {
  return match(code)
    .on(200, () => 'OK')
    .on(301, () => 'Moved')
    .on(404, () => 'Not Found')
    .on(500, () => 'Server Error')
    .otherwise(() => 'Unknown')
}

console.log(getStatus(200)) // "OK"
```

### Multiple Values

```typescript
const getCategory = (code: number) => {
  return match(code)
    .onAny([200, 201, 202], () => 'Success')
    .onAny([400, 401, 403], () => 'Client Error')
    .on(500, () => 'Server Error')
    .otherwise(() => 'Unknown')
}

console.log(getCategory(200)) // "Success"
console.log(getCategory(400)) // "Client Error"
```

## Complete Examples

### HTTP Status Code Handler

```typescript
interface Response {
  code: number
  message: string
  retry: boolean
}

const handleHttpStatus = (code: number): Response => {
  return match(code)
    .onAny([200, 201, 202, 204], () => ({
      code,
      message: 'Success',
      retry: false
    }))
    .onAny([301, 302, 303, 307], () => ({
      code,
      message: 'Redirect',
      retry: false
    }))
    .onAny([400, 422], () => ({
      code,
      message: 'Bad Request',
      retry: false
    }))
    .onAny([401, 403], () => ({
      code,
      message: 'Unauthorized',
      retry: false
    }))
    .on(404, () => ({
      code,
      message: 'Not Found',
      retry: false
    }))
    .onAny([429, 503], () => ({
      code,
      message: 'Temporary Error',
      retry: true
    }))
    .onAny([500, 502, 504], () => ({
      code,
      message: 'Server Error',
      retry: true
    }))
    .otherwise(() => ({
      code,
      message: 'Unknown Status',
      retry: true
    }))
}

console.log(handleHttpStatus(200)) // { code: 200, message: 'Success', retry: false }
console.log(handleHttpStatus(429)) // { code: 429, message: 'Temporary Error', retry: true }
```

### Notification System

```typescript
interface Notification {
  type: string
  icon: string
  color: string
  duration: number
}

const getNotification = (type: string): Notification => {
  return match(type)
    .on('success', () => ({
      type,
      icon: '✓',
      color: '#22c55e',
      duration: 3000
    }))
    .on('error', () => ({
      type,
      icon: '✗',
      color: '#ef4444',
      duration: 5000
    }))
    .on('warning', () => ({
      type,
      icon: '⚠',
      color: '#f59e0b',
      duration: 4000
    }))
    .on('info', () => ({
      type,
      icon: 'ℹ',
      color: '#3b82f6',
      duration: 3000
    }))
    .otherwise(() => ({
      type,
      icon: '•',
      color: '#6b7280',
      duration: 3000
    }))
}

// Usage
const notification = getNotification('success')
console.log(`[${notification.icon}] ${notification.type}`) // [✓] success
```

### FizzBuzz with Match

```typescript
const fizzBuzz = (n: number): string => {
  return match(true)
    .on(n % 15 === 0, () => 'FizzBuzz')
    .on(n % 3 === 0, () => 'Fizz')
    .on(n % 5 === 0, () => 'Buzz')
    .otherwise(() => n.toString())
}

console.log(fizzBuzz(3)) // "Fizz"
console.log(fizzBuzz(5)) // "Buzz"
console.log(fizzBuzz(15)) // "FizzBuzz"
console.log(fizzBuzz(7)) // "7"
```

### Data Processing

```typescript
interface DataPoint {
  id: string
  status: 'new' | 'processing' | 'completed' | 'failed'
  priority: 'high' | 'medium' | 'low'
}

const processData = (data: DataPoint): string => {
  const action = match(data.status)
    .on('new', () => 'validate')
    .on('processing', () => 'continue')
    .on('completed', () => 'archive')
    .on('failed', () => 'retry')
    .otherwise(() => 'unknown')

  const priority = match(data.priority)
    .on('high', () => 'immediate')
    .on('medium', () => 'scheduled')
    .on('low', () => 'deferred')
    .otherwise(() => 'normal')

  return `${action}:${priority}`
}

console.log(processData({ id: '1', status: 'new', priority: 'high' }))
// "validate:immediate"
```

## See More

- [String Matching Example](/examples/string-matching)
- [HTTP Status Codes Example](/examples/http-status-codes)
- [Predicate/Guard Matching Example](/examples/predicate-matching)
- [Nested Matching Example](/examples/nested-matching)
- [Conditional Logic Example](/examples/conditional-logic)
- [Real-World Use Cases Example](/examples/real-world)
