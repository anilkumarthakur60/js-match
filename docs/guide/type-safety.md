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
import { match, type Handler } from '@anilkumarthakur/match'

// Handler<T> is a function that returns T with no parameters.
// Handlers are always invoked with zero arguments  the subject is not passed in.
type StringHandler = Handler<string> // () => string

const handler: Handler<number> = () => 42
const result = match<string, number>('test')
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
import { match, type Handler } from '@anilkumarthakur/match'

// Generic handler function.
// Use onAny() to match a list of values  on() takes exactly one pattern, so
// spreading an array into it would push the second element into the handler slot.
const createStatusHandler = <T extends string>(status: T, activeStates: readonly T[]): boolean => {
  return match(status)
    .onAny(activeStates, () => true)
    .otherwise(() => false)
}

type PaymentStatus = 'pending' | 'completed' | 'failed' | 'refunded'

const isPaymentActive: Handler<boolean> = () => {
  return createStatusHandler('completed' as PaymentStatus, ['completed', 'pending'])
}

console.log(isPaymentActive()) // true
```

## Inferred vs Pinned Result Types

`match(subject)` leaves the result type open and unions in each handler's return type, so a chain
of agreeing handlers resolves to that one type:

```typescript
const inferred = match('a')
  .on('a', () => 42)
  .otherwise(() => 0)
// inferred: number

const union = match('a')
  .on('a', () => 42)
  .otherwise(() => 'none')
// union: number | string
```

Passing both type arguments **pins** the result instead, and every handler is then checked against
that annotation rather than widening it:

```typescript
const pinned = match<string, number>('a')
  .on('a', () => 42)
  .otherwise(() => 0)
// pinned: number

match<string, number>('a').on('a', () => 'nope') // ✗ Type error
```

Reach for the pinned form when handlers that disagree should be an error rather than a union.

## MatchChain Type

`MatchChain` is the interface `Matcher` implements, so it describes the whole chain surface 
`on`, `onAny`, `otherwise`, `default`, `get`, `valueOf`, `run` and `isMatched`  not just
`on`/`otherwise`:

```typescript
import { match, type MatchChain } from '@anilkumarthakur/match'

// Fresh chain: no handler has contributed a type yet, so TResult is still its `never` default
const fresh: MatchChain<string> = match('test')

// Once handlers have run, name the type they accumulated 
// `MatchChain<string>` would no longer fit, because the chain is now carrying `number`
const chain: MatchChain<string, number> = match('test').on('test', () => 42)

// Or pin it up front, mirroring the two-argument match() form
const pinned: MatchChain<string, number> = match<string, number>('test').on('test', () => 42)

// Only allows matching on strings
// pinned.on(123, () => 1) // ✗ Type error - 123 is not a string

// Results must be numbers
const result: number = pinned.otherwise(() => 0) // ✓
```

`on()` accepts `Pattern<TSubject>`  a literal `TSubject` **or** a `Predicate<TSubject>`  so
predicates typecheck through a `MatchChain` annotation just as they do on `Matcher`:

```typescript
import type { Predicate } from '@anilkumarthakur/match'

const isLong: Predicate<string> = (s) => s.length > 2
pinned.on(isLong, () => 1) // ✓
```

The one exception is a function-valued subject, where the predicate arm is withdrawn because a
predicate could never fire there  see [Function Subjects](/guide/basic-usage#function-subjects).

## Error Handling with Types

Use `UnhandledMatchError` with type safety:

```typescript
import { match, UnhandledMatchError } from '@anilkumarthakur/match'

const getValue = (key: string): string => {
  try {
    return match(key)
      .on('a', () => 'value a')
      .on('b', () => 'value b')
      .get() // May throw
  } catch (error) {
    if (error instanceof UnhandledMatchError) {
      // `error.value` is the raw subject, typed `unknown`
      console.error('Unhandled key:', error.value)
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
