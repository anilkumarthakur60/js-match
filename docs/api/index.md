# API Reference

Complete API documentation for @anilkumarthakur/match.

## Overview

The library provides a simple but powerful API for pattern matching:

```typescript
import {
  match, // Main function
  Matcher, // Class (usually not needed)
  UnhandledMatchError, // Error class
  Handler, // Type
  MatchChain, // Interface
  MatcherHandler // Type (internal)
} from '@anilkumarthakur/match'
```

## Main Exports

### Functions

- [`match(subject)`](/api/match) - Create a new match expression

### Classes

- [`Matcher`](/api/matcher) - Core implementation class
- `UnhandledMatchError` - Error thrown when no match found

### Types

- [`Handler<T>`](/api/types) - Handler function type
- `MatchChain<TSubject, TResult>` - Interface for method chaining
- `MatcherHandler<T>` - Internal handler type

## Quick Reference

| Method                    | Purpose                 | Returns                      |
| ------------------------- | ----------------------- | ---------------------------- |
| `match(subject)`          | Create matcher          | `Matcher<TSubject, TResult>` |
| `.on(value, handler)`     | Add single case         | `this` (for chaining)        |
| `.onAny(values, handler)` | Add multiple cases      | `this` (for chaining)        |
| `.otherwise(handler)`     | Set default & execute   | `TResult`                    |
| `.default(handler)`       | PHP alias for otherwise | `TResult`                    |
| `.valueOf()`              | Execute without default | `TResult`                    |

## Method Documentation

### `match<TSubject, TResult>(subject: TSubject): Matcher<TSubject, TResult>`

Creates a new match expression.

**Parameters:**

- `subject` - The value to match against (any type)

**Returns:** A `Matcher` instance

**Example:**

```typescript
const matcher = match(statusCode)
```

### `.on(value: TSubject, handler: () => TResult): this`

Adds a case to match against using strict equality (===).

**Parameters:**

- `value` - The value to match
- `handler` - Function to execute if matched

**Returns:** The matcher for chaining

**Example:**

```typescript
match(200)
  .on(200, () => 'Success')
  .on(404, () => 'Not Found')
```

### `.onAny(values: readonly TSubject[], handler: () => TResult): this`

Adds multiple values that map to the same handler.

**Parameters:**

- `values` - Array of values to match
- `handler` - Function to execute if any value matches

**Returns:** The matcher for chaining

**Example:**

```typescript
match(code)
  .onAny([200, 201, 202], () => 'Success')
  .onAny([400, 401, 403], () => 'Error')
```

### `.otherwise(handler: () => TResult): TResult`

Sets default handler and executes the match.

**Parameters:**

- `handler` - Function to execute if no cases match

**Returns:** The result from matched handler or default

**Throws:** `UnhandledMatchError` if no match and error handler throws

**Example:**

```typescript
const result = match(value)
  .on('case', () => 'result')
  .otherwise(() => 'default')
```

### `.default(handler: () => TResult): TResult`

PHP-compatible alias for `otherwise()`. Identical behavior.

**Parameters:**

- `handler` - Function to execute if no cases match

**Returns:** The result from matched handler or default

**Example:**

```typescript
const result = match(value)
  .on('case', () => 'result')
  .default(() => 'default')
```

### `.valueOf(): TResult`

Executes the match without a default handler.

**Returns:** The result from matched handler

**Throws:** `UnhandledMatchError` if no match found

**Example:**

```typescript
const result = match(value)
  .on('case', () => 'result')
  .valueOf() // Must have matched!
```

## Error Handling

### `UnhandledMatchError`

Thrown when no case matches and no default handler is provided.

**Properties:**

- `name` - Always "UnhandledMatchError"
- `message` - Contains the unmatched value

**Example:**

```typescript
try {
  match('foo')
    .on('bar', () => 'not matched')
    .valueOf()
} catch (error) {
  if (error instanceof UnhandledMatchError) {
    console.error('No match:', error.message)
  }
}
```

## Next Steps

- [match() Function](/api/match) - Detailed documentation
- [Matcher Class](/api/matcher) - Implementation details
- [Types](/api/types) - Type definitions
- [Examples](/examples/) - Real-world use cases
