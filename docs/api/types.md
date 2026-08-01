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

### `Predicate<T>`

Predicate function type for guard/conditional matching.

```typescript
type Predicate<T> = (value: T) => boolean
```

A function that takes a subject value and returns a boolean indicating whether the match condition is satisfied.

**Type Parameter:**

- `T` - The type of the subject being matched

**Example:**

```typescript
const isPositive: Predicate<number> = (n) => n > 0
const isString: Predicate<unknown> = (v) => typeof v === 'string'
const isLongString: Predicate<string> = (s) => s.length > 10

// Used with match
match(10)
  .on(isPositive, () => 'Positive')
  .otherwise(() => 'Not positive')

// Inline predicates
match(score)
  .on(
    (n) => n >= 90,
    () => 'A'
  )
  .on(
    (n) => n >= 80,
    () => 'B'
  )
```

### `Pattern<TSubject>`

The set of patterns `on()` accepts for a given subject type.

```typescript
export type Pattern<TSubject> = [TSubject] extends [(...args: never[]) => unknown]
  ? TSubject
  : TSubject | Predicate<TSubject>
```

Normally a literal `TSubject` **or** a `Predicate<TSubject>`. When the subject type is itself a
function the predicate arm is withdrawn: a function subject is matched by reference at runtime, so a
predicate would never be invoked and the case would silently fall through. Encoding the rule in the
type turns that into a compile error instead.

```typescript
type P1 = Pattern<number> // number | Predicate<number>
type P2 = Pattern<() => string> // () => string  (no predicate arm)
```

The check is wrapped in a tuple so it does not distribute over unions: for `string | (() => void)`
the runtime decision depends on the value rather than the declared type, so both arms have to stay
available. See [Function Subjects](/api/matcher#function-subjects).

### `Unmatched<TSubject, TRemaining, TPattern>`

The subject values still unaccounted for after one `.on(pattern)` arm. This is the machinery behind
[`exhaustive()`](/api/#exhaustive-tresult).

```typescript
export type Unmatched<TSubject, TRemaining, TPattern> = [TSubject] extends [AnyFunction]
  ? Exclude<TRemaining, TPattern>
  : [TPattern] extends [AnyFunction]
    ? TRemaining
    : Exclude<TRemaining, TPattern>
```

Only a **literal** pattern proves anything about coverage: an arm matching `'a'` removes `'a'` from
what remains. A predicate cannot be evaluated by the type system, so a predicate arm leaves the
remainder untouched — which is why `.exhaustive()` never accepts a guard-driven chain. Reporting
"still incomplete" there is the honest answer, not a limitation to work around.

The function-subject case is tested first to mirror [`Pattern`](#pattern-tsubject): when the subject
is itself a function the pattern is an identity comparison rather than a predicate, so it does
narrow.

```typescript
type A = Unmatched<'a' | 'b', 'a' | 'b', 'a'> // 'b'
type B = Unmatched<'a' | 'b', 'a' | 'b', Predicate<'a' | 'b'>> // 'a' | 'b'
```

**Note:** `Exclude` only removes members of a union, so a subject typed as the whole of `string`
never narrows to `never` — correctly, since no finite set of arms covers every string.

### `NonExhaustive<TRemaining>`

The argument `.exhaustive()` demands while cases are still missing.

```typescript
export interface NonExhaustive<TRemaining> {
  readonly missingCases: TRemaining
  readonly nonExhaustive: never
}
```

No value of this type can be produced — `nonExhaustive` is typed `never` — so the call cannot be
satisfied. That is the entire point: the diagnostic is the feature, not the value. TypeScript reports
the missing argument and names this type, whose `missingCases` parameter spells out on hover exactly
which subject values are unhandled:

```
Argument of type 'string' is not assignable to parameter of
type 'NonExhaustive<"archived" | "draft">'.
```

### `MatcherHandler<T>`

Deprecated alias for `Handler<T>`.

```typescript
export type MatcherHandler<T> = Handler<T>
```

**Note:** Kept exported so existing consumers keep compiling. Use `Handler<T>` instead.

### `MatchChain<TSubject, TResult>`

The interface `Matcher` implements. It describes the **complete** chain surface, and `Matcher`
declares `implements MatchChain<...>` so the compiler catches drift between the published contract
and the shipped class.

```typescript
export interface MatchChain<TSubject, TResult = never> {
  on: (pattern: Pattern<TSubject>, handler: Handler<TResult>) => MatchChain<TSubject, TResult>
  onAny: (values: readonly TSubject[], handler: Handler<TResult>) => MatchChain<TSubject, TResult>
  otherwise: (handler: Handler<TResult>) => TResult
  default: (handler: Handler<TResult>) => TResult
  get: () => TResult
  exhaustive: () => TResult
  /** @deprecated use get() */
  valueOf: () => TResult
  run: () => boolean
  readonly isMatched: boolean
}
```

Simplified for readability: the real declaration threads an extra inference type parameter through
each method so handler return types accumulate, and carries a phantom `TRemaining` parameter that
`exhaustive()` reads to decide whether the chain is complete. See
[Inferred vs Pinned Result Types](/guide/type-safety#inferred-vs-pinned-result-types).

**Type Parameters:**

- `TSubject` - The type of values being matched
- `TResult` - The accumulated return type of handler functions. Leave it at its `never` default to
  have handler return types inferred; pass it explicitly to pin the chain.
- `TPinned` - Internal. Whether `TResult` was pinned by the consumer rather than inferred; derived
  from `TResult` and never passed by hand.
- `TRemaining` - Internal. The subject values no arm has covered yet. It starts as `TSubject` and
  shrinks as literal patterns are added; reaching `never` is what unlocks
  [`exhaustive()`](/api/#exhaustive-tresult).

**Example:**

```typescript
import { match, type MatchChain } from '@anilkumarthakur/match'

// Fresh chain — no handler has contributed a type yet, so TResult is still `never`
const fresh: MatchChain<string> = match('test')

// Inferred: name the type the handlers accumulated. `MatchChain<string>` would
// no longer fit here, because the chain is now carrying `number`.
const chain: MatchChain<string, number> = match('test').on('test', () => 42)

// Pinned up front
const pinned: MatchChain<string, number> = match<string, number>('test').on('test', () => 42)
```

## Classes

### `Matcher<TSubject, TResult>`

The core matcher class.

```typescript
class Matcher<TSubject, TResult> implements MatchChain<TSubject, TResult> {
  constructor(subject: TSubject)
  on(pattern: Pattern<TSubject>, handler: Handler<TResult>): this
  onAny(values: readonly TSubject[], handler: Handler<TResult>): this
  otherwise(handler: Handler<TResult>): TResult
  default(handler: Handler<TResult>): TResult
  get(): TResult
  /** @deprecated use get() */
  valueOf(): TResult
  run(): boolean
  get isMatched(): boolean
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
  readonly value: unknown
}
```

**Properties:**

- `name` - Always "UnhandledMatchError"
- `message` - A best-effort description of the unmatched value. Deliberately lossy for values JSON
  cannot represent (BigInt, symbols, functions, `NaN`, circular structures, `Map`/`Set`), so do not
  parse it.
- `value` - The raw unmatched subject. Branch on this rather than on the message.

**Example:**

```typescript
import { match, UnhandledMatchError } from '@anilkumarthakur/match'

try {
  match('foo')
    .on('bar', () => 'not matched')
    .get()
} catch (error) {
  if (error instanceof UnhandledMatchError) {
    console.error('No match found for:', error.value) // "foo"
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
// Value imports
import { match, Matcher, UnhandledMatchError } from '@anilkumarthakur/match'

// Type-only imports (TypeScript)
import type { Handler, Pattern, Predicate, MatchChain } from '@anilkumarthakur/match'

// Mixed imports
import { match, type Handler } from '@anilkumarthakur/match'
```

`Handler`, `Predicate`, `Pattern`, `MatchChain` and `MatcherHandler` are types, so they must be
imported with `import type` (or an inline `type` modifier) under `verbatimModuleSyntax` and
`isolatedModules`.

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
