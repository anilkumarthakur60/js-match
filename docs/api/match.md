# match() Function

## Signature

```typescript
function match<TSubject, TResult = never>(subject: TSubject): Matcher<TSubject, TResult>
```

## Description

Creates a new match expression for the given subject value. This is the main entry point for using the library.

## Type Parameters

- `TSubject` - The type of the value being matched (inferred from subject)
- `TResult` - The result type of the chain. Defaults to `never`, which means "not pinned": each
  handler's return type is an inference site and the chain accumulates their union.

Leaving `TResult` alone is the common case  `match('a').on('a', () => 42).otherwise(() => 0)`
resolves to `number`, and handlers that disagree produce a union. Passing both type arguments
explicitly **pins** the result type instead, and every handler is checked against that annotation,
so a handler returning the wrong type is a compile error rather than a silent widening.

## Parameters

| Name      | Type       | Description                           |
| --------- | ---------- | ------------------------------------- |
| `subject` | `TSubject` | The value to match against (any type) |

## Returns

A `Matcher<TSubject, TResult>` instance that can be chained with `.on()`, `.onAny()`, `.otherwise()`, etc.

## Examples

### Basic Usage

```typescript
import { match } from '@anilkumarthakur/match'

const result = match('hello')
  .on('hello', () => 'Hello back!')
  .otherwise(() => 'Goodbye')

console.log(result) // "Hello back!"
```

### With Type Parameters

```typescript
// Explicit types
const result = match<string, number>('42')
  .on('42', () => 42)
  .otherwise(() => 0)
```

### Type Inference

```typescript
// Types are inferred automatically
const result = match(42) // TSubject = number
  .on(42, () => 'matched')
  .otherwise(() => 'not matched')

// result type is string (inferred from handlers)
```

### With Different Types

```typescript
// Strings
match('status')
  .on('active', () => true)
  .otherwise(() => false)

// Numbers
match(200)
  .on(200, () => 'OK')
  .otherwise(() => 'Error')

// Booleans
match(isActive)
  .on(true, () => 'Active')
  .on(false, () => 'Inactive')
  .otherwise(() => 'Unknown')

// Custom values
const obj = { type: 'user' }
match(obj)
  .on(obj, () => 'Matched object by reference')
  .otherwise(() => 'Different object')

// Null / Undefined
match(nullValue)
  .on(null, () => 'Null')
  .on(undefined, () => 'Undefined')
  .otherwise(() => 'Has value')
```

### Chaining

```typescript
const result = match(code)
  .on(200, () => 'Success')
  .on(201, () => 'Created')
  .on(404, () => 'Not Found')
  .on(500, () => 'Server Error')
  .otherwise(() => 'Unknown')
```

### With Multiple Values

```typescript
const result = match(status)
  .onAny(['pending', 'processing'], () => 'In Progress')
  .onAny(['success', 'completed'], () => 'Done')
  .onAny(['error', 'failed'], () => 'Failed')
  .otherwise(() => 'Unknown')
```

### Without Default

```typescript
import { match, UnhandledMatchError } from '@anilkumarthakur/match'

try {
  const result = match(value)
    .on('expected', () => 'Found it!')
    .get() // Resolve without a default
} catch (error) {
  if (error instanceof UnhandledMatchError) {
    console.error('No match found for:', error.value)
  }
}
```

### Predicate Matching

`on()` also accepts a guard function, called with the subject:

```typescript
const label = match(42)
  .on(
    (n) => n > 100,
    () => 'large'
  )
  .on(
    (n) => n > 10,
    () => 'medium'
  )
  .otherwise(() => 'small')

console.log(label) // "medium"
```

## Related

- [Matcher Class](/api/matcher) - The class returned by match()
- [.on() Method](/api/matcher#on-pattern-handler-this) - Add a literal or predicate case
- [.onAny() Method](/api/matcher#onany-values-handler-this) - Add multiple cases
- [.otherwise() Method](/api/matcher#otherwise-handler-tresult) - Set default and resolve
