# Type Definitions

Reference for all types exported by @anilkumarthakur/match.

## Types

### `Handler<T>`

Handler function type for match expression results.

```typescript
type Handler<T> = () => T
```

A function that takes no parameters and returns a value of type `T`.

**Type Parameter:**

- `T` - The return type

**Example:**

```typescript
const handler: Handler<string> = () => 'result'
const numHandler: Handler<number> = () => 42
```

### `MatcherHandler<T>`

Internal handler type (same as `Handler<T>`).

```typescript
export type MatcherHandler<T> = () => T
```

**Note:** This is for internal use. Use `Handler<T>` instead.

### `MatchChain<TSubject, TResult>`

Interface for match chain operations.

```typescript
export interface MatchChain<TSubject, TResult> {
  on: (value: TSubject, handler: Handler<TResult>) => MatchChain<TSubject, TResult>
  otherwise: (handler: Handler<TResult>) => TResult
}
```

**Type Parameters:**

- `TSubject` - The type of values being matched
- `TResult` - The return type of handler functions

**Properties:**

- `on()` - Add a single case
- `otherwise()` - Set default and execute

**Example:**

```typescript
import { match, MatchChain } from '@anilkumarthakur/match'

const chain: MatchChain<string, number> = match<string, number>('test').on('test', () => 42)
```

## Classes

### `Matcher<TSubject, TResult>`

The core matcher class.

```typescript
class Matcher<TSubject, TResult> {
  constructor(subject: TSubject)
  on(value: TSubject, handler: Handler<TResult>): this
  onAny(values: readonly TSubject[], handler: Handler<TResult>): this
  otherwise(handler: Handler<TResult>): TResult
  default(handler: Handler<TResult>): TResult
  valueOf(): TResult
}
```

See [Matcher Class](/api/matcher) for details.

### `UnhandledMatchError`

Error thrown when no case matches and no default is provided.

```typescript
class UnhandledMatchError extends Error {
  constructor(value: unknown)
  name: 'UnhandledMatchError'
  message: string
}
```

**Properties:**

- `name` - Always "UnhandledMatchError"
- `message` - Contains the unmatched value

**Example:**

```typescript
import { match, UnhandledMatchError } from '@anilkumarthakur/match'

try {
  match('foo')
    .on('bar', () => 'not matched')
    .valueOf()
} catch (error) {
  if (error instanceof UnhandledMatchError) {
    console.error('No match found:', error.message)
  }
}
```

## Functions

### `match<TSubject, TResult>(subject: TSubject): Matcher<TSubject, TResult>`

Creates a new match expression.

```typescript
import { match } from '@anilkumarthakur/match'

const matcher = match(value)
```

**Type Parameters:**

- `TSubject` - The type of the value being matched (inferred from argument)
- `TResult` - The return type of handlers (inferred from usage)

**Parameters:**

- `subject` - The value to match against

**Returns:** `Matcher<TSubject, TResult>` instance

See [match() Function](/api/match) for details and examples.

## Import Examples

```typescript
// Named imports
import {
  match,
  Matcher,
  UnhandledMatchError,
  Handler,
  MatchChain,
  MatcherHandler
} from '@anilkumarthakur/match'

// Type-only imports (TypeScript)
import type { Handler, MatchChain, MatcherHandler } from '@anilkumarthakur/match'

// Mixed imports
import { match, type Handler } from '@anilkumarthakur/match'
```

## Type Safety

All types are fully exported for type-safe usage in TypeScript:

```typescript
// Explicit type parameters
const matcher = match<string, number>('42')
  .on('42', () => 42)
  .otherwise(() => 0)

// Handler type
const handler: Handler<string> = () => 'result'

// MatchChain type
const chain: MatchChain<string, number> = match<string, number>('test').on('test', () => 123)
```

## Related

- [Type Safety Guide](/guide/type-safety) - How to use types effectively
- [Matcher Class](/api/matcher) - Detailed class documentation
- [match() Function](/api/match) - Detailed function documentation
