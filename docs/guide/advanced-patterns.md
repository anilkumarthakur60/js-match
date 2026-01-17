# Advanced Patterns

Master advanced techniques with @anilkumarthakur/match!

## Predicate Matching

Use predicate functions for powerful conditional logic:

```typescript
import { match } from '@anilkumarthakur/match'

// Range matching
const category = (age: number): string => {
  return match(age)
    .on(
      (n) => n < 13,
      () => 'Child'
    )
    .on(
      (n) => n >= 13 && n < 18,
      () => 'Teen'
    )
    .on(
      (n) => n >= 18 && n < 65,
      () => 'Adult'
    )
    .on(
      (n) => n >= 65,
      () => 'Senior'
    )
    .otherwise(() => 'Unknown')
}

console.log(category(8)) // "Child"
console.log(category(16)) // "Teen"
console.log(category(70)) // "Senior"
```

Predicates enable:

- **Range checks**: `(n) => n > 5 && n < 10`
- **Type checks**: `(v) => typeof v === 'string'`
- **Complex logic**: `(obj) => obj.role === 'admin' && obj.isActive`
- **Array checks**: `(arr) => arr.length > 0`

## Type Checking with Predicates

Guard against different types:

```typescript
const typeLabel = (val: unknown): string => {
  return match(val)
    .on(
      (v: unknown) => typeof v === 'string',
      () => 'String'
    )
    .on(
      (v: unknown) => typeof v === 'number',
      () => 'Number'
    )
    .on(
      (v: unknown) => Array.isArray(v),
      () => 'Array'
    )
    .on(
      (v: unknown) => v === null,
      () => 'Null'
    )
    .on(
      (v: unknown) => v === undefined,
      () => 'Undefined'
    )
    .otherwise(() => 'Object')
}

console.log(typeLabel('hello')) // "String"
console.log(typeLabel([1, 2, 3])) // "Array"
console.log(typeLabel(null)) // "Null"
```

## Mixing Literals and Predicates

Combine literal matching with predicates:

```typescript
const processScore = (score: number | string): string => {
  return match(score)
    .on('N/A', () => 'Not available')
    .on('PENDING', () => 'Awaiting score')
    .on(
      (val: unknown) => typeof val === 'number' && val > 80,
      () => 'High'
    )
    .on(
      (val: unknown) => typeof val === 'number' && val > 50,
      () => 'Medium'
    )
    .otherwise(() => 'Low')
}

console.log(processScore('N/A')) // "Not available"
console.log(processScore(90)) // "High"
console.log(processScore(60)) // "Medium"
```

## Object Shape Checking

Use predicates for structural validation:

```typescript
interface User {
  role: string
  permissions: string[]
}

const checkAccess = (user: unknown): string => {
  return match(user)
    .on(
      (u: unknown): u is User =>
        typeof u === 'object' && u !== null && 'role' in u && u.role === 'admin',
      () => 'Admin access'
    )
    .on(
      (u: unknown): u is User =>
        typeof u === 'object' &&
        u !== null &&
        'permissions' in u &&
        Array.isArray((u as any).permissions) &&
        (u as any).permissions.includes('write'),
      () => 'Write access'
    )
    .otherwise(() => 'Read-only access')
}
```

## Nested Matching

Compose match expressions by nesting them:

```typescript
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

Use `match(true)` with predicates for readable conditionals:

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
console.log(getAgeGroup(70)) // "Senior"
```

## Combining `onAny()` with Predicates

Mix multiple values with predicate functions:

```typescript
const getPriority = (code: string): string => {
  return match(code)
    .onAny(['CRITICAL', 'URGENT'], () => 'P0 - Immediate')
    .onAny(['HIGH', 'IMPORTANT'], () => 'P1 - Action required')
    .on(
      (c) => c.length > 10,
      () => 'P2 - Long description'
    )
    .on('LOW', () => 'P3 - Eventually')
    .otherwise(() => 'Unknown')
}

console.log(getPriority('CRITICAL')) // "P0 - Immediate"
console.log(getPriority('some-long-description')) // "P2 - Long description"
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

  return {
    ...handler,
    priority: handler.retry ? 'high' : 'low'
  }
}
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

## Using `run()` for Side Effects

Execute patterns for side effects only:

```typescript
const handleUserAction = (action: string, userId: string) => {
  const handled = match(action)
    .on('login', () => {
      localStorage.setItem('lastLogin', new Date().toISOString())
      logEvent('user.login', { userId })
    })
    .on('logout', () => {
      localStorage.removeItem('session')
      logEvent('user.logout', { userId })
    })
    .on('delete', () => {
      removeUserData(userId)
      logEvent('user.delete', { userId })
    })
    .run()

  if (!handled) {
    console.warn(`Unknown action: ${action}`)
  }
}
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
