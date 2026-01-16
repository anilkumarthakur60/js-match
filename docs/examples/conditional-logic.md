# Conditional Logic

Using match(true) for conditional pattern matching.

## Basic Conditional Logic

```typescript
import { match } from '@anilkumarthakur/match'

// Instead of complex if-else chains
const getAgeGroup = (age: number): string => {
  return match(true)
    .on(age < 13, () => 'Child')
    .on(age >= 13 && age < 18, () => 'Teen')
    .on(age >= 18 && age < 65, () => 'Adult')
    .on(age >= 65, () => 'Senior')
    .otherwise(() => 'Unknown')
}

console.log(getAgeGroup(5)) // "Child"
console.log(getAgeGroup(16)) // "Teen"
console.log(getAgeGroup(25)) // "Adult"
console.log(getAgeGroup(70)) // "Senior"
```

## Number Range Matching

```typescript
const getScoreGrade = (score: number): string => {
  return match(true)
    .on(score >= 90, () => 'A')
    .on(score >= 80, () => 'B')
    .on(score >= 70, () => 'C')
    .on(score >= 60, () => 'D')
    .on(score >= 0, () => 'F')
    .otherwise(() => 'Invalid')
}

console.log(getScoreGrade(95)) // "A"
console.log(getScoreGrade(85)) // "B"
console.log(getScoreGrade(72)) // "C"
console.log(getScoreGrade(50)) // "F"
```

## String Content Checking

```typescript
const getEmailProvider = (email: string): string => {
  return match(true)
    .on(email.endsWith('@gmail.com'), () => 'Gmail')
    .on(email.endsWith('@yahoo.com'), () => 'Yahoo')
    .on(email.endsWith('@outlook.com'), () => 'Outlook')
    .on(email.endsWith('@company.com'), () => 'Company')
    .on(email.includes('@'), () => 'Other')
    .otherwise(() => 'Invalid Email')
}

console.log(getEmailProvider('user@gmail.com')) // "Gmail"
console.log(getEmailProvider('user@company.com')) // "Company"
console.log(getEmailProvider('invalid-email')) // "Invalid Email"
```

## Multiple Conditions

```typescript
interface User {
  age: number
  isActive: boolean
  isPremium: boolean
}

const getUserTier = (user: User): string => {
  return match(true)
    .on(user.isPremium && user.isActive, () => 'Premium Active')
    .on(user.isPremium && !user.isActive, () => 'Premium Inactive')
    .on(!user.isPremium && user.isActive && user.age >= 18, () => 'Active Adult')
    .on(!user.isPremium && user.isActive && user.age < 18, () => 'Active Minor')
    .on(!user.isActive && user.age < 18, () => 'Inactive Minor')
    .otherwise(() => 'Inactive')
}

const user1: User = { age: 25, isActive: true, isPremium: true }
const user2: User = { age: 15, isActive: true, isPremium: false }

console.log(getUserTier(user1)) // "Premium Active"
console.log(getUserTier(user2)) // "Active Minor"
```

## Array Operations

```typescript
const getCollectionStatus = (items: any[]): string => {
  return match(true)
    .on(items.length === 0, () => 'Empty')
    .on(items.length === 1, () => 'Single Item')
    .on(items.length > 1 && items.length < 10, () => 'Few Items')
    .on(items.length >= 10 && items.length < 100, () => 'Many Items')
    .on(items.length >= 100, () => 'Large Collection')
    .otherwise(() => 'Invalid')
}

console.log(getCollectionStatus([])) // "Empty"
console.log(getCollectionStatus([1])) // "Single Item"
console.log(getCollectionStatus([1, 2, 3])) // "Few Items"
```

## Date and Time

```typescript
const getTimeOfDay = (hour: number): string => {
  return match(true)
    .on(hour >= 0 && hour < 6, () => 'Night')
    .on(hour >= 6 && hour < 12, () => 'Morning')
    .on(hour >= 12 && hour < 18, () => 'Afternoon')
    .on(hour >= 18 && hour < 24, () => 'Evening')
    .otherwise(() => 'Invalid Hour')
}

console.log(getTimeOfDay(3)) // "Night"
console.log(getTimeOfDay(9)) // "Morning"
console.log(getTimeOfDay(15)) // "Afternoon"
console.log(getTimeOfDay(20)) // "Evening"
```

## Percentage-Based Logic

```typescript
const getLoadingStatus = (percentage: number): string => {
  return match(true)
    .on(percentage === 0, () => 'Not Started')
    .on(percentage > 0 && percentage < 25, () => 'Just Started')
    .on(percentage >= 25 && percentage < 50, () => 'Quarter Done')
    .on(percentage >= 50 && percentage < 75, () => 'Half Done')
    .on(percentage >= 75 && percentage < 100, () => 'Almost Done')
    .on(percentage === 100, () => 'Complete')
    .otherwise(() => 'Invalid')
}

console.log(getLoadingStatus(0)) // "Not Started"
console.log(getLoadingStatus(30)) // "Quarter Done"
console.log(getLoadingStatus(75)) // "Almost Done"
console.log(getLoadingStatus(100)) // "Complete"
```

## Inventory Status

```typescript
interface Product {
  stock: number
  reorderLevel: number
  maxStock: number
}

const getStockStatus = (product: Product): string => {
  return match(true)
    .on(product.stock === 0, () => 'Out of Stock')
    .on(product.stock < product.reorderLevel, () => 'Low Stock')
    .on(product.stock >= product.maxStock, () => 'Overstocked')
    .on(product.stock < product.maxStock, () => 'In Stock')
    .otherwise(() => 'Unknown')
}

const product: Product = { stock: 5, reorderLevel: 10, maxStock: 100 }
console.log(getStockStatus(product)) // "Low Stock"
```

## Performance Metrics

```typescript
interface PageLoad {
  loadTime: number // in milliseconds
}

const getPerformanceRating = (page: PageLoad): string => {
  return match(true)
    .on(page.loadTime < 1000, () => '🟢 Excellent')
    .on(page.loadTime >= 1000 && page.loadTime < 3000, () => '🟡 Good')
    .on(page.loadTime >= 3000 && page.loadTime < 5000, () => '🟠 Fair')
    .on(page.loadTime >= 5000, () => '🔴 Poor')
    .otherwise(() => 'Unknown')
}

console.log(getPerformanceRating({ loadTime: 500 })) // "🟢 Excellent"
console.log(getPerformanceRating({ loadTime: 2500 })) // "🟡 Good"
console.log(getPerformanceRating({ loadTime: 6000 })) // "🔴 Poor"
```

## Complex Business Logic

```typescript
interface Invoice {
  amount: number
  daysOverdue: number
  paymentAttempts: number
}

const getCollectionStrategy = (invoice: Invoice): string => {
  return match(true)
    .on(invoice.daysOverdue === 0, () => 'Send Payment Reminder')
    .on(invoice.daysOverdue > 0 && invoice.daysOverdue <= 15, () => 'Send First Notice')
    .on(invoice.daysOverdue > 15 && invoice.daysOverdue <= 30, () => 'Send Second Notice')
    .on(
      invoice.daysOverdue > 30 && invoice.daysOverdue <= 60 && invoice.paymentAttempts < 3,
      () => 'Contact Customer'
    )
    .on(invoice.daysOverdue > 60 && invoice.paymentAttempts >= 3, () => 'Send to Collections')
    .on(invoice.amount > 10000 && invoice.daysOverdue > 30, () => 'Escalate to Finance Manager')
    .otherwise(() => 'Standard Collection')
}

const invoice: Invoice = { amount: 5000, daysOverdue: 45, paymentAttempts: 2 }
console.log(getCollectionStrategy(invoice)) // "Contact Customer"
```

## Next Examples

- [Real-World Use Cases](/examples/real-world)
- [String Matching](/examples/string-matching)
- [HTTP Status Codes](/examples/http-status-codes)
