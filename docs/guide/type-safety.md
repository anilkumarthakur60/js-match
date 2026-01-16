# Type Safety

Leverage TypeScript for type-safe match expressions!

## Basic Type Inference

TypeScript automatically infers types from your usage:

```typescript
import { match } from '@anilkumarthakur/match'

// Types are inferred automatically
const result = match('success')
  .on('success', () => 'Operation succeeded') // string
  .on('error', () => 'Operation failed') // string
  .otherwise(() => 'Unknown') // string
// result is inferred as: string

// Types are checked at compile time
const result2 = match(200)
  .on(200, () => 'OK')
  .on(404, () => 'Not Found')
  .otherwise(() => 'Unknown') // All must be strings
// result2 is inferred as: string
```

## Explicit Type Parameters

For complex scenarios, specify types explicitly:

```typescript
// Explicit types: match<Subject, Result>
const result = match<number | string, boolean>(42)
  .on(42, () => true)
  .on('test', () => false)
  .otherwise(() => false)
```

## Union Types

Match on union types for exhaustiveness:

```typescript
type Status = 'pending' | 'active' | 'inactive' | 'deleted'

const getStatusLabel = (status: Status): string => {
  return match(status)
    .on('pending', () => 'Pending Review')
    .on('active', () => 'Active')
    .on('inactive', () => 'Inactive')
    .on('deleted', () => 'Deleted')
    .otherwise(() => 'Unknown') // Never reached, but good practice
}

console.log(getStatusLabel('active')) // "Active"
```

## Strict Type Checking

Ensure all cases return the same type:

```typescript
// ✅ Good - all returns are strings
const result = match(code)
  .on(200, () => 'OK')
  .on(404, () => 'Not Found')
  .otherwise(() => 'Unknown')

// ❌ Bad - return types don't match
const badResult = match(code)
  .on(200, () => 'OK')
  .on(404, () => 404) // Type error! Should be string
  .otherwise(() => 'Unknown')
```

## Handler Types

Use `Handler` type for handler functions:

```typescript
import { match, Handler } from '@anilkumarthakur/match'

// Handler<T> is a function that returns T with no parameters
type ResultHandler = Handler<string> // () => string

const handler: Handler<number> = () => 42
const result = match('test')
  .on('test', handler) // ✓ Correctly typed
  .otherwise(() => 0)
```

## Complex Return Types

Match on values that return objects, arrays, or complex types:

```typescript
interface Config {
  timeout: number
  retries: number
  debug: boolean
}

type Environment = 'development' | 'staging' | 'production'

const getConfig = (env: Environment): Config => {
  return match(env)
    .on('development', () => ({
      timeout: 5000,
      retries: 1,
      debug: true
    }))
    .on('staging', () => ({
      timeout: 10000,
      retries: 3,
      debug: false
    }))
    .on('production', () => ({
      timeout: 30000,
      retries: 5,
      debug: false
    }))
    .otherwise(() => ({
      timeout: 5000,
      retries: 1,
      debug: true
    }))
}

// Type-safe usage
const config = getConfig('production')
config.timeout // ✓ number
config.retries // ✓ number
config.debug // ✓ boolean
// config.foo  // ✗ Property 'foo' does not exist
```

## Generics

Create reusable match patterns with generics:

```typescript
// Generic handler function
const createStatusHandler = <T extends string>(status: T, activeStates: readonly T[]): boolean => {
  return match(status)
    .on(...(activeStates as [T, ...T[]]), () => true)
    .otherwise(() => false)
}

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

const isPaymentActive: Handler<boolean> = () => {
  return createStatusHandler('completed' as PaymentStatus, ['completed', 'pending'] as const)
}

console.log(isPaymentActive()) // true
```

## MatchChain Type

The `MatchChain` interface defines the API:

```typescript
import { match, MatchChain } from '@anilkumarthakur/match'

// MatchChain<Subject, Result>
const chain: MatchChain<string, number> = match<string, number>('test').on('test', () => 42)

// Only allows matching on strings
// chain.on(123, () => 1) // ✗ Type error - 123 is not a string

// Results must be numbers
const result: number = chain.otherwise(() => 0) // ✓
```

## Error Handling with Types

Use `UnhandledMatchError` with type safety:

```typescript
import { match, UnhandledMatchError } from '@anilkumarthakur/match'

const getValue = (key: string): string => {
  try {
    return match(key)
      .on('a', () => 'value a')
      .on('b', () => 'value b')
      .valueOf() // May throw
  } catch (error) {
    if (error instanceof UnhandledMatchError) {
      console.error('Unhandled key:', error.message)
      return 'default'
    }
    throw error // Re-throw other errors
  }
}
```

## Best Practices

1. **Use Union Types**: Define specific types for subjects

   ```typescript
   type Status = 'active' | 'inactive' // Better than string
   ```

2. **Return Consistent Types**: All handlers should return the same type

   ```typescript
   .on('case1', () => 'string')
   .on('case2', () => 'string') // ✓
   ```

3. **Use `otherwise()`**: Always provide a default case

   ```typescript
   match(value)
     .on('case', () => 'result')
     .otherwise(() => 'default') // ✓
   ```

4. **Avoid `any`**: Let TypeScript infer types

   ```typescript
   match(value) // ✓ Types inferred
   // match<any, any>(value) // ✗ Avoid
   ```

5. **Use Enums or Literals**: For better type checking
   ```typescript
   enum Status {
     Active = 'active',
     Inactive = 'inactive'
   }
   const result = match(Status.Active) // ✓ Type-safe
   ```

## Next Steps

- [Examples](/examples/) - See real-world use cases
- [API Reference](/api/) - Complete API documentation
