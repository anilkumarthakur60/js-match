# Matcher Class

## Signature

```typescript
class Matcher<TSubject, TResult> implements MatchChain<TSubject, TResult> {
  constructor(subject: TSubject)
  on(pattern: Pattern<TSubject>, handler: () => TResult): this
  onAny(values: readonly TSubject[], handler: () => TResult): this
  otherwise(handler: () => TResult): TResult
  default(handler: () => TResult): TResult
  get(): TResult
  /** @deprecated alias for get() */
  valueOf(): TResult
  run(): boolean
  get isMatched(): boolean
}
```

`Pattern<TSubject>` is `TSubject | Predicate<TSubject>` — except when `TSubject` is itself a
function type, where the predicate arm is withdrawn. See [Function Subjects](#function-subjects).

## Description

The `Matcher` class implements the match expression pattern with eager execution. Handlers execute immediately when a match is found. It supports both literal value matching and predicate functions.

## Type Parameters

- `TSubject` - The type of values being matched
- `TResult` - The return type of handler functions

## Constructor

```typescript
new Matcher<TSubject, TResult>(subject: TSubject)
```

Usually, you don't instantiate this directly. Use the `match()` function instead:

```typescript
import { match } from '@anilkumarthakur/match'

const matcher = match(value) // Not new Matcher(value)
```

## Methods

### `on(pattern, handler): this`

Adds a case to match against. Pattern can be a literal value or a predicate function.

```typescript
matcher.on(pattern, handler)
```

**Parameters:**

- `pattern: Pattern<TSubject>` - Literal value (matched with `Object.is()`) or predicate function `(subject) => boolean`
- `handler: () => TResult` - Function to execute if matched, invoked with **no** arguments

**Returns:** `this` for method chaining

**Behavior:**

- If pattern is a function AND subject is not a function → treat as predicate
- If pattern is a literal → use `Object.is()` for comparison
- If already matched, this call is ignored (first match wins)
- Handlers execute **immediately** upon match

**Examples:**

```typescript
// Literal matching
match(200).on(200, () => 'Success')

// Predicate matching
match(10)
  .on(
    (n) => n > 5,
    () => 'Greater than 5'
  )
  .on(
    (n) => n <= 5,
    () => 'Less than or equal to 5'
  )

// Mixed
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

### `onAny(values, handler): this`

Adds multiple literal values that all map to the same handler.

```typescript
matcher.onAny(values, handler)
```

**Parameters:**

- `values: readonly TSubject[]` - Array of literal values to match
- `handler: () => TResult` - Function to execute if any value matches

**Returns:** `this` for method chaining

**Note:** `onAny()` uses `Object.is()` for each comparison, so `NaN` will match.

**Example:**

```typescript
match(code)
  .onAny([200, 201, 202], () => 'Success')
  .onAny([400, 401, 403], () => 'Client Error')
```

### `otherwise(handler): TResult`

Sets the default handler and executes the match expression. Called if no matches found.

```typescript
const result = matcher.otherwise(handler)
```

**Parameters:**

- `handler: () => TResult` - Function to execute if no cases match

**Returns:** `TResult` - The result from matched handler or default

**Throws:** Any error thrown by the handler

**Example:**

```typescript
const result = match(value)
  .on('case1', () => 'result1')
  .otherwise(() => 'default')
```

### `default(handler): TResult`

PHP-compatible alias for `otherwise()`. Identical behavior.

```typescript
const result = matcher.default(handler)
```

**Parameters:**

- `handler: () => TResult` - Function to execute if no cases match

**Returns:** `TResult` - The result from matched handler or default

**Example:**

```typescript
const result = match(value)
  .on('case1', () => 'result1')
  .default(() => 'default')
```

### `get(): TResult`

Resolves the match with no default handler.

```typescript
const result = matcher.get()
```

**Returns:** `TResult` - The result from the matched handler

**Throws:** `UnhandledMatchError` if no match found

**Example:**

```typescript
import { match, UnhandledMatchError } from '@anilkumarthakur/match'

try {
  const result = match('test')
    .on('test', () => 'matched')
    .get()
  console.log(result) // "matched"
} catch (error) {
  if (error instanceof UnhandledMatchError) {
    console.error('No match for:', error.value)
  }
}
```

### `valueOf(): TResult`

::: warning Deprecated
Use [`get()`](#get-tresult). `valueOf()` is kept only for backwards compatibility.
:::

Identical behaviour to `get()`, but `valueOf` is a slot in JavaScript's `ToPrimitive` protocol, so
the engine invokes it on any implicit coercion — `matcher + 1`, `matcher == x`, a sort comparator,
string interpolation via `String()`. Two consequences:

- an unmatched chain throws `UnhandledMatchError` from an expression that never mentions the method;
- a matched chain silently leaks its result into arithmetic and comparisons.

```typescript
const matched = match(1).on(1, () => 'one')
matched + '' // "one" — the result leaks out via coercion

const unmatched = match(1).on(2, () => 'two')
unmatched + '' // throws UnhandledMatchError: Unhandled match value: 1
```

`get()` has no such coupling to the language, so resolution is always explicit.

### `run(): boolean`

Execute for side effects only. Returns boolean indicating if a match occurred.

```typescript
const didMatch = matcher.run()
```

**Returns:** `boolean` - `true` if a match was found and handler executed, `false` otherwise

**Example:**

```typescript
const handled = match(action)
  .on('save', () => saveData())
  .on('delete', () => deleteData())
  .run()

if (!handled) {
  console.warn('Unknown action')
}
```

### `isMatched` Property

Get current match state.

```typescript
const matched = matcher.isMatched
```

**Returns:** `boolean` - `true` if a match has been found

**Example:**

```typescript
const matcher = match('test').on('test', () => 'matched')
console.log(matcher.isMatched) // true

const matcher2 = match('other').on('test', () => 'matched')
console.log(matcher2.isMatched) // false
```

## Behavior Notes

### Eager Execution

Handlers execute **immediately** when matched, before returning from `.on()`:

```typescript
let value = 'initial'
match('test').on('test', () => {
  value = 'changed'
})
// value is now 'changed'
console.log(value) // "changed"
```

### First Match Wins

Once a match is found, subsequent `.on()` calls are ignored:

```typescript
let calls = 0
match('x')
  .on('x', () => {
    calls++
  })
  .on('x', () => {
    calls++
  }) // ignored
  .otherwise(() => {})
console.log(calls) // 1
```

### Object.is() Semantics

Matching uses `Object.is()` instead of `===`. They diverge on exactly two values:

```typescript
match(NaN).on(NaN, () => 'matched!') // Works! `NaN === NaN` would be false

match(+0)
  .on(-0, () => 'nope')
  .on(+0, () => 'matched!') // Works! Object.is(+0, -0) === false
```

`onAny()` applies `Object.is()` per element, so the same rules hold there.

### Function Subjects

A function-valued subject disables predicate matching for the whole chain: `on()` compares the
pattern to the subject by reference rather than calling it, because that is the only way a function
value stays matchable literally.

```typescript
const fn = () => 'subject'

match(fn)
  .on(
    (v) => true,
    () => 'predicate ran'
  ) // never invoked — no error, no warning
  .otherwise(() => 'fell through')
// Result: "fell through"

match(fn)
  .on(fn, () => 'matched by reference')
  .otherwise(() => 'no match')
// Result: "matched by reference"
```

`Pattern<TSubject>` encodes this rule in the type system, so in TypeScript passing a predicate for a
function subject is a compile error. Two gaps remain: plain JavaScript, and subjects whose declared
type is a _union_ containing a function — there the decision is value-dependent, so both arms stay
available and the silent fall-through is reachable.

## Complete Example

```typescript
import { match } from '@anilkumarthakur/match'

// Grade calculator with predicates
const grade = (score: number) =>
  match(score)
    .on(
      (n) => n >= 90,
      () => 'A'
    )
    .on(
      (n) => n >= 80,
      () => 'B'
    )
    .on(
      (n) => n >= 70,
      () => 'C'
    )
    .otherwise(() => 'F')

console.log(grade(95)) // "A"
console.log(grade(75)) // "C"

// Side-effect handler
let status = 'pending'
match('ready')
  .on('ready', () => {
    status = 'active'
  })
  .on('stop', () => {
    status = 'stopped'
  })
// status is now 'active'

console.log(status) // "active"
```

## Related

- [match() Function](/api/match) - The recommended way to create matchers
- [Predicate Type](/api/types#predicate-t) - Function predicate type
- [Pattern Type](/api/types#pattern-tsubject) - What `on()` accepts
- [UnhandledMatchError](/api/types#unhandledmatcherror) - Error thrown on no match
