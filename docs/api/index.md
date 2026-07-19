# API Reference

Complete API documentation for @anilkumarthakur/match.

## Overview

The library provides a simple but powerful API for pattern matching:

```typescript
import {
  match, // Main function
  Matcher, // Class (usually not needed)
  UnhandledMatchError, // Error class
  type Handler, // Type
  type Predicate, // Type
  type Pattern, // Type
  type MatchChain, // Interface
  type MatcherHandler // Type (deprecated alias for Handler)
} from '@anilkumarthakur/match'
```

## Main Exports

### Functions

- [`match(subject)`](/api/match) - Create a new match expression

### Classes

- [`Matcher`](/api/matcher) - Core implementation class
- `UnhandledMatchError` - Error thrown when no match found

### Types

- [`Handler<T>`](/api/types) - Handler function type, `() => T`
- [`Predicate<T>`](/api/types#predicate-t) - Guard function type, `(value: T) => boolean`
- [`Pattern<TSubject>`](/api/types#pattern-tsubject) - What `on()` accepts: a literal or a predicate
- `MatchChain<TSubject, TResult>` - Interface describing the full chain surface
- `MatcherHandler<T>` - Deprecated alias for `Handler<T>`

## Quick Reference

| Method                    | Purpose                             | Returns                      |
| ------------------------- | ----------------------------------- | ---------------------------- |
| `match(subject)`          | Create matcher                      | `Matcher<TSubject, TResult>` |
| `.on(pattern, handler)`   | Add a literal or predicate case     | `this` (for chaining)        |
| `.onAny(values, handler)` | Add multiple literal cases          | `this` (for chaining)        |
| `.otherwise(handler)`     | Set default & resolve               | `TResult`                    |
| `.default(handler)`       | PHP alias for `otherwise()`         | `TResult`                    |
| `.get()`                  | Resolve without default (may throw) | `TResult`                    |
| `.valueOf()`              | Deprecated alias for `get()`        | `TResult`                    |
| `.run()`                  | Resolve to "did anything match?"    | `boolean`                    |
| `.isMatched`              | Inspect match state (getter)        | `boolean`                    |

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

### `.on(pattern: Pattern<TSubject>, handler: () => TResult): this`

Adds a case. `pattern` is either a literal value, compared with `Object.is()` — **not** `===` — or a
predicate function `(subject) => boolean`.

**Parameters:**

- `pattern` - A literal value, or a predicate receiving the subject
- `handler` - Function to execute if matched (invoked with no arguments)

**Returns:** The matcher for chaining

**Example:**

```typescript
// Literal
match(200)
  .on(200, () => 'Success')
  .on(404, () => 'Not Found')

// Predicate
match(10)
  .on(
    (n) => n > 5,
    () => 'Greater than 5'
  )
  .otherwise(() => 'Small')
```

::: tip Object.is(), not ===
`NaN` matches `NaN` and `+0` does not match `-0`. See
[Object.is() Semantics](/guide/basic-usage#object-is-semantics).
:::

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

**Throws:** Whatever the handler throws. `otherwise()` itself never throws
`UnhandledMatchError` — supplying a fallback is precisely what rules that out.

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

### `.get(): TResult`

Resolves the match with no default handler.

**Returns:** The result from the matched handler

**Throws:** `UnhandledMatchError` if no match found

**Example:**

```typescript
const result = match(value)
  .on('case', () => 'result')
  .get() // Must have matched!
```

### `.valueOf(): TResult`

Deprecated alias for `get()`. Prefer `get()`.

`valueOf` is JavaScript's `ToPrimitive` hook, so the engine calls it on any implicit coercion. An
unmatched chain therefore throws from expressions that never name the method:

```typescript
const matcher = match(1).on(2, () => 'two')
matcher + '' // throws UnhandledMatchError: Unhandled match value: 1
```

### `.run(): boolean`

Resolves the chain to whether anything matched, for side-effect-only patterns. Handlers have
already run by this point — matching is eager.

**Returns:** `true` if a case matched, `false` otherwise

```typescript
const handled = match(action)
  .on('save', () => saveData())
  .on('delete', () => deleteData())
  .run()
```

### `.isMatched: boolean`

Read-only getter for the current match state. Unlike `run()` it does not terminate the chain.

```typescript
const matcher = match('test').on('test', () => 'matched')
console.log(matcher.isMatched) // true
```

## Error Handling

### `UnhandledMatchError`

Thrown when no case matches and no default handler is provided.

**Properties:**

- `name` - Always "UnhandledMatchError"
- `message` - A best-effort description of the unmatched value. Deliberately lossy for exotic
  values (BigInt, symbols, circular structures, `Map`/`Set`), so do not parse it.
- `value` - The raw unmatched subject, typed `unknown`. Branch on this rather than the message.

**Example:**

```typescript
try {
  match('foo')
    .on('bar', () => 'not matched')
    .get()
} catch (error) {
  if (error instanceof UnhandledMatchError) {
    console.error('No match:', error.value) // "foo"
  }
}
```

## Next Steps

- [match() Function](/api/match) - Detailed documentation
- [Matcher Class](/api/matcher) - Implementation details
- [Types](/api/types) - Type definitions
- [Examples](/examples/) - Real-world use cases
