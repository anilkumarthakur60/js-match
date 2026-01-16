# Matcher Class

## Signature

```typescript
class Matcher<TSubject, TResult> {
  constructor(subject: TSubject)
  on(value: TSubject, handler: () => TResult): this
  onAny(values: readonly TSubject[], handler: () => TResult): this
  otherwise(handler: () => TResult): TResult
  default(handler: () => TResult): TResult
  valueOf(): TResult
}
```

## Description

The `Matcher` class implements the match expression pattern. It uses a Map internally for O(1) lookup performance.

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

### `on(value, handler): this`

Adds a single case to match against using strict equality (===).

```typescript
matcher.on(value, handler)
```

**Parameters:**

- `value: TSubject` - The value to match
- `handler: () => TResult` - Function to execute if matched

**Returns:** `this` for method chaining

**Example:**

```typescript
match(200)
  .on(200, () => 'Success')
  .on(404, () => 'Not Found')
```

### `onAny(values, handler): this`

Adds multiple values that all map to the same handler.

```typescript
matcher.onAny(values, handler)
```

**Parameters:**

- `values: readonly TSubject[]` - Array of values to match
- `handler: () => TResult` - Function to execute if any value matches

**Returns:** `this` for method chaining

**Example:**

```typescript
match(code)
  .onAny([200, 201, 202], () => 'Success')
  .onAny([400, 401, 403], () => 'Client Error')
```

### `otherwise(handler): TResult`

Sets the default handler and executes the match expression.

```typescript
const result = matcher.otherwise(handler)
```

**Parameters:**

- `handler: () => TResult` - Function to execute if no cases match

**Returns:** `TResult` - The result from matched handler or default

**Throws:** `UnhandledMatchError` if handler throws and error is not caught

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

### `valueOf(): TResult`

Executes the match without a default handler.

```typescript
const result = matcher.valueOf()
```

**Returns:** `TResult` - The result from matched handler

**Throws:** `UnhandledMatchError` if no match found

**Example:**

```typescript
const result = match('test')
  .on('test', () => 'matched')
  .valueOf() // Must have a match
```

## Properties

The `Matcher` class has the following private properties (for internal use only):

- `subject: TSubject` - The value being matched against
- `matches: Map<TSubject, () => TResult>` - Map of values to handlers
- `defaultHandler?: () => TResult` - The default handler, if set

## Implementation Details

- **Performance**: Uses JavaScript Map for O(1) lookup time
- **Matching**: Uses strict equality (===) for comparison
- **Chaining**: `.on()` and `.onAny()` return `this` for fluent interface
- **Execution**: `.otherwise()`, `.default()`, and `.valueOf()` execute immediately

## Complete Example

```typescript
import { match, Matcher } from '@anilkumarthakur/match'

// Using match() function (recommended)
const result1 = match('active')
  .on('active', () => 'Active')
  .on('inactive', () => 'Inactive')
  .otherwise(() => 'Unknown')

// Using Matcher class directly (not recommended)
const matcher = new Matcher<string, string>('active')
matcher.on('active', () => 'Active')
matcher.on('inactive', () => 'Inactive')
const result2 = matcher.otherwise(() => 'Unknown')

console.log(result1) // "Active"
console.log(result2) // "Active"
```

## Related

- [match() Function](/api/match) - The recommended way to create matchers
- [UnhandledMatchError](/api/types#unhandledmatcherror) - Error thrown on no match
- [MatchChain Interface](/api/types#matchchaininterface) - Type for the API
