# String Matching

Examples of matching on string values.

## Basic String Matching

```typescript
import { match } from '@anilkumarthakur/match'

const getEmoji = (animal: string): string => {
  return match(animal)
    .on('dog', () => '🐕')
    .on('cat', () => '🐈')
    .on('bird', () => '🐦')
    .on('fish', () => '🐠')
    .otherwise(() => '❓')
}

console.log(getEmoji('dog')) // 🐕
console.log(getEmoji('cat')) // 🐈
console.log(getEmoji('unknown')) // ❓
```

## User Roles

```typescript
type Role = 'admin' | 'moderator' | 'user' | 'guest'

const getPermissions = (role: Role): string[] => {
  return match(role)
    .on('admin', () => ['read', 'write', 'delete', 'manage_users', 'manage_roles'])
    .on('moderator', () => ['read', 'write', 'delete', 'moderate_content'])
    .on('user', () => ['read', 'write'])
    .on('guest', () => ['read'])
    .otherwise(() => [])
}

const getMenuItems = (role: Role): string[] => {
  return match(role)
    .on('admin', () => ['Dashboard', 'Users', 'Settings', 'Reports', 'Logs'])
    .on('moderator', () => ['Dashboard', 'Content', 'Moderation', 'Reports'])
    .on('user', () => ['Dashboard', 'My Content', 'Settings'])
    .on('guest', () => ['Home', 'Browse'])
    .otherwise(() => ['Home'])
}

console.log(getPermissions('admin')) // ['read', 'write', 'delete', 'manage_users', 'manage_roles']
console.log(getMenuItems('guest')) // ['Home', 'Browse']
```

## Product Categories

```typescript
interface Product {
  name: string
  category: string
}

const getProductDetails = (
  product: Product
): { icon: string; color: string; department: string } => {
  return match(product.category)
    .on('electronics', () => ({
      icon: '🔌',
      color: '#3b82f6',
      department: 'Tech'
    }))
    .on('clothing', () => ({
      icon: '👕',
      color: '#ec4899',
      department: 'Fashion'
    }))
    .on('books', () => ({
      icon: '📚',
      color: '#8b5cf6',
      department: 'Media'
    }))
    .on('food', () => ({
      icon: '🍕',
      color: '#f59e0b',
      department: 'Grocery'
    }))
    .otherwise(() => ({
      icon: '📦',
      color: '#6b7280',
      department: 'General'
    }))
}

const product: Product = { name: 'Laptop', category: 'electronics' }
console.log(getProductDetails(product))
// { icon: '🔌', color: '#3b82f6', department: 'Tech' }
```

## Language Selection

```typescript
type Language = 'en' | 'es' | 'fr' | 'de' | 'zh' | 'ja'

const getGreeting = (language: Language): string => {
  return match(language)
    .on('en', () => 'Hello')
    .on('es', () => 'Hola')
    .on('fr', () => 'Bonjour')
    .on('de', () => 'Hallo')
    .on('zh', () => '你好')
    .on('ja', () => 'こんにちは')
    .otherwise(() => 'Hi')
}

const getLocale = (language: Language): string => {
  return match(language)
    .on('en', () => 'en_US')
    .on('es', () => 'es_ES')
    .on('fr', () => 'fr_FR')
    .on('de', () => 'de_DE')
    .on('zh', () => 'zh_CN')
    .on('ja', () => 'ja_JP')
    .otherwise(() => 'en_US')
}

console.log(getGreeting('en')) // "Hello"
console.log(getLocale('fr')) // "fr_FR"
```

## Status Badges

```typescript
type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled' | 'returned'

const getStatusBadge = (
  status: OrderStatus
): { text: string; background: string; foreground: string } => {
  return match(status)
    .on('pending', () => ({
      text: 'Pending',
      background: '#fef3c7',
      foreground: '#92400e'
    }))
    .on('confirmed', () => ({
      text: 'Confirmed',
      background: '#dbeafe',
      foreground: '#1e40af'
    }))
    .on('shipped', () => ({
      text: 'Shipped',
      background: '#f3e8ff',
      foreground: '#5b21b6'
    }))
    .on('delivered', () => ({
      text: 'Delivered',
      background: '#dcfce7',
      foreground: '#15803d'
    }))
    .onAny(['cancelled', 'returned'], () => ({
      text: status === 'cancelled' ? 'Cancelled' : 'Returned',
      background: '#fee2e2',
      foreground: '#991b1b'
    }))
    .otherwise(() => ({
      text: 'Unknown',
      background: '#f3f4f6',
      foreground: '#374151'
    }))
}

console.log(getStatusBadge('delivered'))
// { text: 'Delivered', background: '#dcfce7', foreground: '#15803d' }
```

## Event Types

```typescript
type EventType = 'click' | 'change' | 'submit' | 'focus' | 'blur' | 'hover'

// Parameter is `string`, not EventType, so unrecognised event names can reach
// the fallback. Narrowing it to EventType would make the last call a type error.
const getEventHandler = (eventType: EventType | string) => {
  return match(eventType)
    .on('click', () => 'handleClick')
    .on('change', () => 'handleChange')
    .on('submit', () => 'handleSubmit')
    .on('focus', () => 'handleFocus')
    .on('blur', () => 'handleBlur')
    .on('hover', () => 'handleHover')
    .otherwise(() => 'handleDefault')
}

console.log(getEventHandler('click')) // "handleClick"
console.log(getEventHandler('unknown')) // "handleDefault"
```

## Next Examples

- [HTTP Status Codes](/examples/http-status-codes)
- [Nested Matching](/examples/nested-matching)
- [Conditional Logic](/examples/conditional-logic)
- [Real-World Use Cases](/examples/real-world)
