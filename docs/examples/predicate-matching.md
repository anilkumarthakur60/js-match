# Predicate/Guard Matching

Learn how to use predicate functions for flexible conditional logic and range matching.

## Basic Predicate Matching

Use function predicates instead of literal values:

```typescript
import { match } from '@anilkumarthakur/match'

const rating = (score: number): string => {
  return match(score)
    .on(
      (n) => n >= 90,
      () => '⭐⭐⭐⭐⭐'
    )
    .on(
      (n) => n >= 80,
      () => '⭐⭐⭐⭐'
    )
    .on(
      (n) => n >= 70,
      () => '⭐⭐⭐'
    )
    .on(
      (n) => n >= 60,
      () => '⭐⭐'
    )
    .on(
      (n) => n >= 50,
      () => '⭐'
    )
    .otherwise(() => '❌')
}

console.log(rating(95)) // "⭐⭐⭐⭐⭐"
console.log(rating(75)) // "⭐⭐⭐"
console.log(rating(45)) // "❌"
```

## Type Checking

Guard against different types using type checks:

```typescript
const describe = (value: unknown): string => {
  return match(value)
    .on(
      (v: unknown) => typeof v === 'string' && v.length > 0,
      () => 'Non-empty string'
    )
    .on(
      (v: unknown) => typeof v === 'string',
      () => 'Empty string'
    )
    .on(
      (v: unknown) => typeof v === 'number' && !isNaN(v),
      () => 'Valid number'
    )
    .on(
      (v: unknown) => typeof v === 'number',
      () => 'NaN'
    )
    .on(
      (v: unknown) => Array.isArray(v) && v.length > 0,
      () => 'Non-empty array'
    )
    .on(
      (v: unknown) => Array.isArray(v),
      () => 'Empty array'
    )
    .on(
      (v: unknown) => typeof v === 'object' && v !== null,
      () => 'Object'
    )
    .on(
      (v: unknown) => v === null,
      () => 'Null'
    )
    .on(
      (v: unknown) => v === undefined,
      () => 'Undefined'
    )
    .otherwise(() => 'Unknown')
}

console.log(describe('hello')) // "Non-empty string"
console.log(describe('')) // "Empty string"
console.log(describe([1, 2, 3])) // "Non-empty array"
console.log(describe(null)) // "Null"
```

## Complex Business Logic

Use predicates for complex domain-specific logic:

```typescript
interface Order {
  total: number
  itemCount: number
  customerLevel: 'gold' | 'silver' | 'bronze'
  isInternational: boolean
}

const calculateShipping = (order: Order): number => {
  return match(order)
    .on(
      (o) => o.customerLevel === 'gold' && o.total > 100,
      () => 0
    ) // Free
    .on(
      (o) => o.customerLevel === 'gold',
      () => 5
    ) // Discounted
    .on(
      (o) => o.itemCount > 10 && o.isInternational,
      () => 45
    )
    .on(
      (o) => o.itemCount > 10,
      () => 15
    )
    .on(
      (o) => o.isInternational,
      () => 35
    )
    .otherwise(() => 10)
}

const orders = [
  { total: 150, itemCount: 3, customerLevel: 'gold', isInternational: false },
  { total: 50, itemCount: 3, customerLevel: 'silver', isInternational: false },
  { total: 200, itemCount: 15, customerLevel: 'bronze', isInternational: true }
]

orders.forEach((order) => {
  console.log(`Shipping: $${calculateShipping(order)}`)
})
// Shipping: $0
// Shipping: $10
// Shipping: $45
```

## Age-Based Classification

Common example: categorize by age ranges:

```typescript
const ageGroup = (age: number): string => {
  return match(age)
    .on(
      (n) => n < 0,
      () => 'Invalid'
    )
    .on(
      (n) => n < 13,
      () => 'Child (0-12)'
    )
    .on(
      (n) => n < 20,
      () => 'Teen (13-19)'
    )
    .on(
      (n) => n < 30,
      () => 'Young Adult (20-29)'
    )
    .on(
      (n) => n < 60,
      () => 'Adult (30-59)'
    )
    .on(
      (n) => n < 100,
      () => 'Senior (60-99)'
    )
    .otherwise(() => 'Centenarian (100+)')
}

;[5, 15, 25, 45, 75, 105].forEach((age) => {
  console.log(`Age ${age}: ${ageGroup(age)}`)
})
// Age 5: Child (0-12)
// Age 15: Teen (13-19)
// Age 25: Young Adult (20-29)
// Age 45: Adult (30-59)
// Age 75: Senior (60-99)
// Age 105: Centenarian (100+)
```

## HTTP Status Code Ranges

Match HTTP status codes by range:

```typescript
const httpStatus = (code: number): string => {
  return match(code)
    .on(
      (c) => c >= 200 && c < 300,
      () => 'Success'
    )
    .on(
      (c) => c >= 300 && c < 400,
      () => 'Redirect'
    )
    .on(
      (c) => c >= 400 && c < 500,
      () => 'Client Error'
    )
    .on(
      (c) => c >= 500 && c < 600,
      () => 'Server Error'
    )
    .otherwise(() => 'Unknown')
}

console.log(httpStatus(200)) // "Success"
console.log(httpStatus(301)) // "Redirect"
console.log(httpStatus(404)) // "Client Error"
console.log(httpStatus(500)) // "Server Error"
```

## Array Length Guards

Use predicates with array operations:

```typescript
const summarizeArray = (arr: unknown[]): string => {
  return match(arr)
    .on(
      (a) => a.length === 0,
      () => 'Empty array'
    )
    .on(
      (a) => a.length === 1,
      () => `Single item: ${arr[0]}`
    )
    .on(
      (a) => a.length <= 5,
      () => `Few items (${arr.length})`
    )
    .on(
      (a) => a.length <= 100,
      () => `Many items (${arr.length})`
    )
    .otherwise(() => `Huge array (${arr.length})`)
}

console.log(summarizeArray([])) // "Empty array"
console.log(summarizeArray([1])) // "Single item: 1"
console.log(summarizeArray([1, 2, 3])) // "Few items (3)"
console.log(summarizeArray(Array.from({ length: 1000 }, (_, i) => i))) // "Huge array (1000)"
```

## Mixing Literals and Predicates

Combine both for maximum flexibility:

```typescript
interface Document {
  type: 'pdf' | 'doc' | 'xls' | 'unknown'
  size: number // in bytes
}

const documentStatus = (doc: Document): string => {
  return match(doc)
    .on(
      (d) => d.type === 'pdf' && d.size > 10 * 1024 * 1024,
      () => 'Large PDF'
    )
    .on('pdf', () => 'Small PDF')
    .on(
      (d) => d.size > 5 * 1024 * 1024,
      () => 'Large file'
    )
    .on('doc', () => 'Document')
    .on('xls', () => 'Spreadsheet')
    .otherwise(() => 'Unknown format')
}

console.log(documentStatus({ type: 'pdf', size: 15 * 1024 * 1024 })) // "Large PDF"
console.log(documentStatus({ type: 'pdf', size: 2 * 1024 * 1024 })) // "Small PDF"
console.log(documentStatus({ type: 'doc', size: 1024 })) // "Document"
```

## String Pattern Matching

Use predicates with string methods:

```typescript
const emailType = (email: string): string => {
  return match(email)
    .on(
      (e) => e.includes('@gmail.com'),
      () => 'Gmail'
    )
    .on(
      (e) => e.includes('@outlook.com'),
      () => 'Outlook'
    )
    .on(
      (e) => e.includes('@company.com'),
      () => 'Company Email'
    )
    .on(
      (e) => /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(e),
      () => 'Valid Email'
    )
    .otherwise(() => 'Invalid Email')
}

console.log(emailType('john@gmail.com')) // "Gmail"
console.log(emailType('jane@company.com')) // "Company Email"
console.log(emailType('bob@outlook.com')) // "Outlook"
console.log(emailType('invalid-email')) // "Invalid Email"
```

## FizzBuzz with Predicates

Classic FizzBuzz using match and predicates:

```typescript
const fizzBuzz = (n: number): string => {
  return match(n)
    .on(
      (x) => x % 15 === 0,
      () => 'FizzBuzz'
    )
    .on(
      (x) => x % 3 === 0,
      () => 'Fizz'
    )
    .on(
      (x) => x % 5 === 0,
      () => 'Buzz'
    )
    .otherwise(() => String(n))
}

for (let i = 1; i <= 15; i++) {
  console.log(fizzBuzz(i))
}
// 1, 2, Fizz, 4, Buzz, Fizz, 7, 8, Fizz, Buzz, 11, Fizz, 13, 14, FizzBuzz
```

## See Also

- [Advanced Patterns](/guide/advanced-patterns)
- [Conditional Logic](/examples/conditional-logic)
