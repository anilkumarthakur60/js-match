# Advanced Patterns

Master advanced techniques with @anilkumarthakur/match!

## Nested Matching

Compose match expressions by nesting them:

```typescript
import { match } from '@anilkumarthakur/match'

const getUserAccess = (userType: string, status: string): string => {
  return match(userType)
    .on('admin', () => {
      return match(status)
        .on('active', () => 'Admin - Full Access')
        .on('suspended', () => 'Admin - Suspended')
        .otherwise(() => 'Admin - Limited')
    })
    .on('user', () => {
      return match(status)
        .on('active', () => 'User - Limited Access')
        .on('suspended', () => 'User - Blocked')
        .otherwise(() => 'User - Pending')
    })
    .otherwise(() => 'Unknown Role')
}

console.log(getUserAccess('admin', 'active')) // "Admin - Full Access"
console.log(getUserAccess('user', 'suspended')) // "User - Blocked"
```

## Conditional Logic with `match(true)`

Use `match(true)` for conditional logic:

```typescript
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

## Combining `onAny()` with `on()`

Mix multiple values with single values:

```typescript
const getPriority = (code: string): string => {
  return match(code)
    .onAny(['CRITICAL', 'URGENT'], () => 'P0 - Immediate action')
    .onAny(['HIGH', 'IMPORTANT'], () => 'P1 - Action required')
    .on('MEDIUM', () => 'P2 - Plan soon')
    .on('LOW', () => 'P3 - Eventually')
    .otherwise(() => 'Unknown priority')
}

console.log(getPriority('CRITICAL')) // "P0 - Immediate action"
console.log(getPriority('HIGH')) // "P1 - Action required"
```

## Composing with Object Methods

Combine match with object methods:

```typescript
interface User {
  id: string
  role: 'admin' | 'user' | 'guest'
  isActive: boolean
}

const getPermissions = (user: User): string[] => {
  const basePermissions = match(user.role)
    .on('admin', () => ['read', 'write', 'delete', 'manage_users'])
    .on('user', () => ['read', 'write'])
    .on('guest', () => ['read'])
    .otherwise(() => [])

  if (!user.isActive) {
    return basePermissions.filter((p) => p !== 'write' && p !== 'delete')
  }

  return basePermissions
}

const admin: User = { id: '1', role: 'admin', isActive: true }
const inactiveUser: User = { id: '2', role: 'user', isActive: false }

console.log(getPermissions(admin)) // ['read', 'write', 'delete', 'manage_users']
console.log(getPermissions(inactiveUser)) // ['read']
```

## Chaining Handlers

Return values from handlers that can be further processed:

```typescript
const processOrder = (status: string) => {
  const handler = match(status)
    .on('pending', () => ({
      action: 'verify_payment',
      retry: true,
      timeout: 5000
    }))
    .on('verified', () => ({
      action: 'process_order',
      retry: true,
      timeout: 10000
    }))
    .on('shipped', () => ({
      action: 'track_package',
      retry: false,
      timeout: 0
    }))
    .otherwise(() => ({
      action: 'unknown',
      retry: false,
      timeout: 0
    }))

  // Use the result
  return {
    ...handler,
    priority: handler.retry ? 'high' : 'low'
  }
}

console.log(processOrder('pending'))
// { action: 'verify_payment', retry: true, timeout: 5000, priority: 'high' }
```

## Match as Factory

Use match to create factory functions:

```typescript
const createValidator = (type: 'email' | 'phone' | 'zipcode') => {
  return (value: string): boolean => {
    return match(type)
      .on('email', () => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value))
      .on('phone', () => /^\d{10}$/.test(value))
      .on('zipcode', () => /^\d{5}$/.test(value))
      .otherwise(() => false)
  }
}

const validateEmail = createValidator('email')
const validatePhone = createValidator('phone')

console.log(validateEmail('test@example.com')) // true
console.log(validatePhone('1234567890')) // true
```

## Async Handlers

Handlers can be async for async operations:

```typescript
const fetchUserData = async (userId: string) => {
  return match(userId)
    .on('current', async () => {
      const response = await fetch('/api/current-user')
      return response.json()
    })
    .on('profile', async () => {
      const response = await fetch('/api/profile')
      return response.json()
    })
    .otherwise(async () => {
      const response = await fetch(`/api/users/${userId}`)
      return response.json()
    })
}

// Usage
const data = await fetchUserData('current')
```

## Pattern with Maps/Objects

Use match with collection operations:

```typescript
const users = [
  { id: 1, status: 'active' },
  { id: 2, status: 'inactive' },
  { id: 3, status: 'pending' }
]

const enhancedUsers = users.map((user) => ({
  ...user,
  badge: match(user.status)
    .on('active', () => '✓')
    .on('inactive', () => '✗')
    .on('pending', () => '⏳')
    .otherwise(() => '?')
}))

console.log(enhancedUsers)
// [
//   { id: 1, status: 'active', badge: '✓' },
//   { id: 2, status: 'inactive', badge: '✗' },
//   { id: 3, status: 'pending', badge: '⏳' }
// ]
```

## Next Steps

- [Type Safety](/guide/type-safety) - Leverage TypeScript fully
- [Examples](/examples/) - See real-world use cases
