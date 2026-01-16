# Nested Matching

Advanced patterns using nested match expressions.

## Basic Nested Matching

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
    .on('moderator', () => {
      return match(status)
        .on('active', () => 'Moderator - Can moderate')
        .on('suspended', () => 'Moderator - Banned')
        .otherwise(() => 'Moderator - Limited')
    })
    .on('user', () => {
      return match(status)
        .on('active', () => 'User - Can post')
        .on('banned', () => 'User - Banned')
        .otherwise(() => 'User - Limited')
    })
    .otherwise(() => 'Unknown Role')
}

console.log(getUserAccess('admin', 'active')) // "Admin - Full Access"
console.log(getUserAccess('user', 'banned')) // "User - Banned"
console.log(getUserAccess('unknown', 'active')) // "Unknown Role"
```

## Transaction Status with Nested Logic

```typescript
interface Transaction {
  type: 'payment' | 'refund' | 'transfer'
  status: 'pending' | 'completed' | 'failed'
}

const getTransactionInfo = (tx: Transaction): { action: string; message: string } => {
  return match(tx.type)
    .on('payment', () => {
      return match(tx.status)
        .on('pending', () => ({
          action: 'wait',
          message: 'Payment is being processed...'
        }))
        .on('completed', () => ({
          action: 'success',
          message: 'Payment completed successfully'
        }))
        .on('failed', () => ({
          action: 'retry',
          message: 'Payment failed - please try again'
        }))
        .otherwise(() => ({
          action: 'error',
          message: 'Unknown payment status'
        }))
    })
    .on('refund', () => {
      return match(tx.status)
        .on('pending', () => ({
          action: 'wait',
          message: 'Refund is being processed...'
        }))
        .on('completed', () => ({
          action: 'success',
          message: 'Refund completed'
        }))
        .on('failed', () => ({
          action: 'support',
          message: 'Refund failed - contact support'
        }))
        .otherwise(() => ({
          action: 'error',
          message: 'Unknown refund status'
        }))
    })
    .on('transfer', () => {
      return match(tx.status)
        .on('pending', () => ({
          action: 'wait',
          message: 'Transfer in progress...'
        }))
        .on('completed', () => ({
          action: 'success',
          message: 'Transfer completed'
        }))
        .on('failed', () => ({
          action: 'retry',
          message: 'Transfer failed - retry?'
        }))
        .otherwise(() => ({
          action: 'error',
          message: 'Unknown transfer status'
        }))
    })
    .otherwise(() => ({
      action: 'error',
      message: 'Unknown transaction type'
    }))
}

console.log(getTransactionInfo({ type: 'payment', status: 'completed' }))
// { action: 'success', message: 'Payment completed successfully' }
```

## Multi-Level Nested Matching

```typescript
interface Order {
  status: 'new' | 'processing' | 'shipped' | 'delivered'
  priority: 'urgent' | 'normal' | 'low'
  paymentMethod: 'card' | 'wallet' | 'cod'
}

const getOrderWorkflow = (order: Order): { nextStep: string; timeframe: string } => {
  return match(order.status)
    .on('new', () => {
      return match(order.priority)
        .on('urgent', () => ({
          nextStep: 'Process immediately',
          timeframe: '1 hour'
        }))
        .on('normal', () => ({
          nextStep: 'Add to queue',
          timeframe: '4 hours'
        }))
        .on('low', () => ({
          nextStep: 'Schedule for next batch',
          timeframe: '24 hours'
        }))
        .otherwise(() => ({
          nextStep: 'Verify',
          timeframe: 'Unknown'
        }))
    })
    .on('processing', () => {
      return match(order.paymentMethod)
        .on('card', () => ({
          nextStep: 'Verify card payment',
          timeframe: '15 minutes'
        }))
        .on('wallet', () => ({
          nextStep: 'Check wallet balance',
          timeframe: '5 minutes'
        }))
        .on('cod', () => ({
          nextStep: 'Prepare for shipment',
          timeframe: '1 hour'
        }))
        .otherwise(() => ({
          nextStep: 'Verify payment',
          timeframe: 'Unknown'
        }))
    })
    .on('shipped', () => ({
      nextStep: 'Track shipment',
      timeframe: 'In transit'
    }))
    .on('delivered', () => ({
      nextStep: 'Collect feedback',
      timeframe: 'Complete'
    }))
    .otherwise(() => ({
      nextStep: 'Unknown',
      timeframe: 'Unknown'
    }))
}

const order: Order = { status: 'processing', priority: 'normal', paymentMethod: 'card' }
console.log(getOrderWorkflow(order))
// { nextStep: 'Verify card payment', timeframe: '15 minutes' }
```

## Nested Matching with Arrays

```typescript
interface User {
  role: 'admin' | 'user'
  status: 'active' | 'inactive'
  permissions: string[]
}

const getPermissionActions = (user: User): string[] => {
  return match(user.role)
    .on('admin', () => {
      return match(user.status)
        .on('active', () => [
          'create_content',
          'edit_content',
          'delete_content',
          'manage_users',
          'view_analytics'
        ])
        .on('inactive', () => ['view_content', 'view_analytics'])
        .otherwise(() => [])
    })
    .on('user', () => {
      return match(user.status)
        .on('active', () => ['create_content', 'edit_own_content', 'delete_own_content'])
        .on('inactive', () => ['view_content'])
        .otherwise(() => [])
    })
    .otherwise(() => [])
}

const admin: User = { role: 'admin', status: 'active', permissions: [] }
console.log(getPermissionActions(admin))
// ['create_content', 'edit_content', 'delete_content', 'manage_users', 'view_analytics']
```

## Nested Matching with Default Fallthrough

```typescript
interface Document {
  type: 'report' | 'memo' | 'draft'
  visibility: 'public' | 'private' | 'shared'
}

const getAccessLevel = (doc: Document): number => {
  return match(doc.type)
    .on('report', () => {
      return match(doc.visibility)
        .on('public', () => 3)
        .on('shared', () => 2)
        .on('private', () => 1)
        .otherwise(() => 0)
    })
    .on('memo', () => {
      return match(doc.visibility)
        .on('public', () => 2)
        .on('shared', () => 1)
        .on('private', () => 0)
        .otherwise(() => -1)
    })
    .otherwise(() => {
      // Default for any other type
      return match(doc.visibility)
        .on('public', () => 1)
        .on('shared', () => 0)
        .on('private', () => -1)
        .otherwise(() => -1)
    })
}

console.log(getAccessLevel({ type: 'report', visibility: 'public' })) // 3
console.log(getAccessLevel({ type: 'memo', visibility: 'shared' })) // 1
```

## Next Examples

- [Conditional Logic](/examples/conditional-logic)
- [Real-World Use Cases](/examples/real-world)
