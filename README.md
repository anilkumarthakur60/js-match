# @anilkumarthakur/match

[![npm version](https://img.shields.io/npm/v/@anilkumarthakur/match)](https://www.npmjs.com/package/@anilkumarthakur/match)
[![license](https://img.shields.io/npm/l/@anilkumarthakur/match)](LICENSE)
[![tests](https://img.shields.io/badge/tests-245-brightgreen)](test/)
[![coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)](#)

PHP-style match expressions for JavaScript/TypeScript with 100% type safety and comprehensive test coverage.

`@anilkumarthakur/match` brings the power and elegance of PHP's match expression to the JavaScript/TypeScript world. It provides a clean, type-safe alternative to complex switch statements and nested if-else logic.

## Features

✨ **Type-Safe**: Full TypeScript support with generic types for subject and result  
🎯 **Readable**: Clean, expressive syntax inspired by PHP match expressions  
🚀 **Fast**: Efficient equality-based matching using JavaScript's Map  
📦 **Lightweight**: Zero dependencies, ~1.2KB gzipped  
🧪 **Well-Tested**: 245 comprehensive tests with 100% code coverage  
🔗 **Chainable**: Fluent API for method chaining  
🌍 **Cross-Platform**: Works in Node.js and browsers (ESM + UMD)

## Installation

### npm

```bash
npm install @anilkumarthakur/match
```

### yarn

```bash
yarn add @anilkumarthakur/match
```

### bun

```bash
bun add @anilkumarthakur/match
```

## Quick Start

```typescript
import { match } from '@anilkumarthakur/match'

const result = match('success')
  .on('success', () => 'Operation successful!')
  .on('error', () => 'Something went wrong')
  .otherwise(() => 'Unknown status')

console.log(result) // "Operation successful!"
```

## API Reference

### `match<TSubject, TResult>(subject: TSubject): Matcher`

Creates a new match expression for the given subject value.

**Parameters:**

- `subject` - The value to match against (any type)

**Returns:** A `Matcher` instance for method chaining

**Example:**

```typescript
const matcher = match(statusCode)
```

### `on(value: TSubject, handler: () => TResult): Matcher`

Adds a case to match against. Uses strict equality (===) for comparison.

**Parameters:**

- `value` - The value to match
- `handler` - Function returning the result if matched

**Returns:** The matcher instance (for chaining)

**Example:**

```typescript
match(status)
  .on(200, () => 'Success')
  .on(404, () => 'Not Found')
```

### `onAny(values: readonly TSubject[], handler: () => TResult): Matcher`

Adds multiple values that all map to the same handler (simulates PHP's comma-separated cases).

**Parameters:**

- `values` - Array of values to match
- `handler` - Function to execute if any value matches

**Returns:** The matcher instance (for chaining)

**Example:**

```typescript
match(status)
  .onAny([200, 201, 202], () => 'Success')
  .onAny([400, 401, 403], () => 'Client Error')
```

### `otherwise(handler: () => TResult): TResult`

Sets the default handler and executes the match. Returns immediately with the result.

**Parameters:**

- `handler` - Function to execute if no cases match

**Returns:** The result from matched handler or default handler

**Throws:** `UnhandledMatchError` if no match found and no default provided

**Example:**

```typescript
const result = match(value)
  .on('expected', () => 'matched')
  .otherwise(() => 'default')
```

### `default(handler: () => TResult): TResult`

PHP-compatible alias for `otherwise()`. Identical behavior.

**Example:**

```typescript
const result = match(value)
  .on('expected', () => 'matched')
  .default(() => 'default')
```

### `valueOf(): TResult`

Executes the match without a default handler. Throws if no match found.

**Returns:** The result from matched handler

**Throws:** `UnhandledMatchError` if no match found

**Example:**

```typescript
const result = match('test')
  .on('test', () => 'matched')
  .valueOf() // Must have matched something
```

### `UnhandledMatchError`

Custom error thrown when no case matches and no default handler is provided.

**Properties:**

- `name` - "UnhandledMatchError"
- `message` - Contains the unmatched value

**Example:**

```typescript
try {
  match('foo')
    .on('bar', () => 'bar')
    .valueOf()
} catch (error) {
  if (error instanceof UnhandledMatchError) {
    console.error('No match found for:', error.message)
  }
}
```

## Usage Examples

### Basic String Matching

```typescript
import { match } from '@anilkumarthakur/match'

const getRole = (role: string) => {
  return match(role)
    .on('admin', () => 'Full access')
    .on('user', () => 'Limited access')
    .on('guest', () => 'Read-only access')
    .otherwise(() => 'Unknown role')
}

console.log(getRole('admin')) // "Full access"
```

### Number Matching (HTTP Status Codes)

```typescript
const handleResponse = (statusCode: number) => {
  return match(statusCode)
    .on(200, () => 'OK')
    .onAny([201, 202, 204], () => 'Created/Accepted')
    .on(400, () => 'Bad Request')
    .on(401, () => 'Unauthorized')
    .on(404, () => 'Not Found')
    .on(500, () => 'Server Error')
    .otherwise(() => 'Unknown Status')
}

console.log(handleResponse(200)) // "OK"
console.log(handleResponse(201)) // "Created/Accepted"
console.log(handleResponse(999)) // "Unknown Status"
```

### Complex Notifications

```typescript
const showNotification = (type: string, message: string) => {
  const styling = match(type)
    .on('success', () => ({ color: 'green', icon: '✓' }))
    .on('error', () => ({ color: 'red', icon: '✗' }))
    .on('warning', () => ({ color: 'orange', icon: '⚠' }))
    .on('info', () => ({ color: 'blue', icon: 'ℹ' }))
    .otherwise(() => ({ color: 'gray', icon: '•' }))

  return `[${styling.icon}] ${message}`
}

console.log(showNotification('success', 'Saved!')) // "[✓] Saved!"
console.log(showNotification('error', 'Failed!')) // "[✗] Failed!"
```

### Nested Match Expressions

```typescript
const getUserStatus = (userId: string, status: string) => {
  return match(userId)
    .on('admin', () => {
      return match(status)
        .on('active', () => 'Admin is active')
        .on('inactive', () => 'Admin is inactive')
        .otherwise(() => 'Admin status unknown')
    })
    .on('user', () => {
      return match(status)
        .on('active', () => 'User is active')
        .otherwise(() => 'User is inactive')
    })
    .otherwise(() => 'User not found')
}

console.log(getUserStatus('admin', 'active')) // "Admin is active"
console.log(getUserStatus('user', 'active')) // "User is active"
console.log(getUserStatus('guest', 'active')) // "User not found"
```

### Type-Safe Unions

```typescript
type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const getLogColor = (level: LogLevel): string => {
  return match(level)
    .on('debug', () => 'gray')
    .on('info', () => 'blue')
    .on('warn', () => 'yellow')
    .on('error', () => 'red')
    .otherwise(() => 'white')
}

console.log(getLogColor('info')) // "blue"
```

### Conditional Logic with match(true)

```typescript
const getUserMessage = (age: number, isPremium: boolean) => {
  return match(true)
    .on(age < 13, () => 'Not eligible')
    .on(age >= 13 && age < 18, () => 'Teen user')
    .on(age >= 18 && !isPremium, () => 'Free user')
    .on(age >= 18 && isPremium, () => 'Premium user')
    .otherwise(() => 'Unknown')
}

console.log(getUserMessage(25, true)) // "Premium user"
console.log(getUserMessage(16, false)) // "Teen user"
```

### Days in Month (Real-World Example)

```typescript
const daysInMonth = (month: string, year: number): number => {
  const isLeap = (y: number) => y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)

  return match(month.toLowerCase().slice(0, 3))
    .on('jan', () => 31)
    .on('feb', () => (isLeap(year) ? 29 : 28))
    .on('mar', () => 31)
    .on('apr', () => 30)
    .on('may', () => 31)
    .on('jun', () => 30)
    .on('jul', () => 31)
    .on('aug', () => 31)
    .on('sep', () => 30)
    .on('oct', () => 31)
    .on('nov', () => 30)
    .on('dec', () => 31)
    .otherwise(() => {
      throw new Error('Invalid month')
    })
}

console.log(daysInMonth('February', 2024)) // 29 (leap year)
console.log(daysInMonth('February', 2025)) // 28
```

## Comparison with PHP match()

### PHP

```php
$result = match($status) {
    'success', 'ok' => 'All good',
    'error', 'fail' => 'Something went wrong',
    default => 'Unknown'
};
```

### JavaScript (this library)

```typescript
const result = match(status)
  .onAny(['success', 'ok'], () => 'All good')
  .onAny(['error', 'fail'], () => 'Something went wrong')
  .otherwise(() => 'Unknown')
```

## Supported Types

The library supports matching on any JavaScript type using strict equality (===):

- ✅ Strings
- ✅ Numbers (including Infinity, -Infinity)
- ✅ Booleans
- ✅ null / undefined
- ✅ Symbols
- ✅ BigInt
- ✅ Objects (by reference)
- ✅ Arrays (by reference)
- ✅ Functions (by reference)
- ✅ Enums
- ✅ Class instances (by reference)

## Type Safety

Full TypeScript support with automatic type inference:

```typescript
// Explicit types
const result = match<string, number>('test')
  .on('test', () => 123)
  .otherwise(() => 456)

// Inferred types
const result2 = match('test')
  .on('test', () => 'result') // Inferred as string result
  .otherwise(() => 'default')

// Union types
type Status = 'success' | 'pending' | 'error'
const result3 = match<Status, string>('success')
  .on('success', () => 'Done')
  .on('pending', () => 'In progress')
  .on('error', () => 'Failed')
  .otherwise(() => 'Unknown')
```

## Performance

- ⚡ Uses JavaScript Map for O(1) lookup time
- 💾 Lazy evaluation - only matched handler executes
- 📦 ~1.2KB gzipped bundle size

## Testing

The library includes 245 comprehensive tests with 100% code coverage:

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Watch mode
npm test -- --watch
```

Test categories:

- Basic functionality
- Type matching (strings, numbers, booleans, objects, arrays, etc.)
- All API methods (on, onAny, otherwise, default, valueOf)
- Error handling
- Type safety
- Real-world examples
- Edge cases and performance

## Browser Support

Works in all modern browsers and Node.js 14+:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Node.js 14+

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development

```bash
# Install dependencies
npm install

# Run tests
npm test

# Build
npm run build

# Lint and format
npm run lint-format
```

## License

MIT - See [LICENSE](LICENSE) for details

## Author

[Anil Kumar Thakur](https://github.com/anilkumarthakur60)

## Related

- [PHP match expression](https://www.php.net/manual/en/control-structures.match.php) - Official PHP documentation
- [JavaScript switch statement](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/switch)

## Changelog

See [CHANGELOG.md](CHANGELOG.md) for release history and updates.
