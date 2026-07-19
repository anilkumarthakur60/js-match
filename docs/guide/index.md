# Guide

Welcome to the @anilkumarthakur/match documentation. This guide will help you understand and use the library effectively.

## What is @anilkumarthakur/match?

@anilkumarthakur/match is a JavaScript/TypeScript library that brings the power and elegance of PHP's match expression to the JavaScript world. It provides a clean, type-safe alternative to complex switch statements and nested if-else logic.

## Key Features

- **Type-Safe**: Full TypeScript support with generic types
- **Readable**: Clean, expressive syntax
- **Fast**: Eager, allocation-free matching — one `Object.is` per case, no lookup table to build
- **Guards**: Predicate functions as well as literals, the headline extension over PHP's `match`
- **Lightweight**: Zero dependencies, ~1 KB gzipped
- **Well-Tested**: Comprehensive test suite at 100% code coverage
- **Chainable**: Fluent API for method chaining

## Why Use @anilkumarthakur/match?

### Traditional Switch Statement

```javascript
const getStatus = (code) => {
  switch (code) {
    case 200:
    case 201:
    case 202:
      return 'Success'
    case 400:
    case 401:
    case 403:
      return 'Client Error'
    case 500:
      return 'Server Error'
    default:
      return 'Unknown'
  }
}
```

### With @anilkumarthakur/match

```typescript
import { match } from '@anilkumarthakur/match'

const getStatus = (code: number) => {
  return match(code)
    .onAny([200, 201, 202], () => 'Success')
    .onAny([400, 401, 403], () => 'Client Error')
    .on(500, () => 'Server Error')
    .otherwise(() => 'Unknown')
}
```

## Advantages

1. **More Readable**: The intent is clearer and easier to follow
2. **Type-Safe**: Full TypeScript support catches errors at compile time
3. **Less Error-Prone**: No fall-through cases or missing breaks
4. **Composable**: Easy to combine with other functional patterns
5. **Testable**: Each case is independent and easy to test

## Next Steps

- [Installation](/guide/installation) - How to install the library
- [Quick Start](/guide/quick-start) - Get up and running in 5 minutes
- [Basic Usage](/guide/basic-usage) - Learn the core concepts
- [Advanced Patterns](/guide/advanced-patterns) - Master advanced techniques
