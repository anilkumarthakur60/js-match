# match() Function

## Signature

```typescript
function match<TSubject, TResult = unknown>(subject: TSubject): Matcher<TSubject, TResult>
```

## Description

Creates a new match expression for the given subject value. This is the main entry point for using the library.

## Type Parameters

- `TSubject` - The type of the value being matched (inferred from subject)
- `TResult` - The return type of handler functions (defaults to `unknown`, specify for type safety)

These are usually inferred automatically, but `TResult` should be specified explicitly when you need type-safe return values.

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
try {
  const result = match(value)
    .on('expected', () => 'Found it!')
    .valueOf() // Execute without default
} catch (error) {
  console.error('No match found')
}
```

## Related

- [Matcher Class](/api/matcher) - The class returned by match()
- [.on() Method](/api/matcher#on) - Add single case
- [.onAny() Method](/api/matcher#onany) - Add multiple cases
- [.otherwise() Method](/api/matcher#otherwise) - Set default and execute
