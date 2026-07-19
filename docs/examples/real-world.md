# Real-World Use Cases

Complex real-world examples using @anilkumarthakur/match.

## E-Commerce Order Management

```typescript
import { match } from '@anilkumarthakur/match'

interface Order {
  id: string
  status:
    'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'returned'
  total: number
  paymentMethod: 'card' | 'bank' | 'wallet'
}

const handleOrderEvent = (order: Order): { action: string; message: string; retry: boolean } => {
  return match(order.status)
    .on('pending', () => ({
      action: 'verify_payment',
      message: 'Verifying payment...',
      retry: true
    }))
    .on('confirmed', () => ({
      action: 'prepare_shipment',
      message: 'Preparing order for shipment...',
      retry: false
    }))
    .on('processing', () => ({
      action: 'update_tracking',
      message: 'Order is being processed',
      retry: false
    }))
    .on('shipped', () => ({
      action: 'send_tracking_email',
      message: 'Order shipped - tracking info sent',
      retry: true
    }))
    .on('delivered', () => ({
      action: 'request_review',
      message: 'Order delivered - requesting feedback',
      retry: false
    }))
    .onAny(['cancelled', 'returned'], () => ({
      action: 'process_refund',
      message: order.status === 'cancelled' ? 'Processing cancellation...' : 'Processing return...',
      retry: true
    }))
    .otherwise(() => ({
      action: 'unknown',
      message: 'Unknown order status',
      retry: false
    }))
}

const order: Order = { id: 'ORD-123', status: 'shipped', total: 99.99, paymentMethod: 'card' }
console.log(handleOrderEvent(order))
// { action: 'send_tracking_email', message: 'Order shipped - tracking info sent', retry: true }
```

## User Authentication Flow

```typescript
interface AuthRequest {
  type: 'login' | 'signup' | 'logout' | 'reset_password' | 'mfa'
  email?: string
  password?: string
  token?: string
}

const processAuthRequest = (
  request: AuthRequest
): Promise<{ success: boolean; message: string; nextStep?: string }> => {
  const handler = match(request.type)
    .on('login', () => async () => {
      // Validate credentials
      const isValid = request.email && request.password
      return {
        success: isValid,
        message: isValid ? 'Login successful' : 'Invalid credentials',
        nextStep: isValid ? 'check_mfa' : undefined
      }
    })
    .on('signup', () => async () => {
      // Register new user
      const isValid = request.email && request.password
      return {
        success: isValid,
        message: isValid ? 'Account created' : 'Invalid email/password',
        nextStep: isValid ? 'verify_email' : undefined
      }
    })
    .on('logout', () => async () => {
      // Clear session
      return {
        success: true,
        message: 'Logged out successfully',
        nextStep: 'redirect_login'
      }
    })
    .on('reset_password', () => async () => {
      // Send reset email
      const isValid = request.email
      return {
        success: isValid,
        message: isValid ? 'Reset email sent' : 'Email not found',
        nextStep: isValid ? 'check_email' : undefined
      }
    })
    .on('mfa', () => async () => {
      // Verify MFA code
      const isValid = request.token && request.token.length === 6
      return {
        success: isValid,
        message: isValid ? 'MFA verified' : 'Invalid code',
        nextStep: isValid ? 'complete_auth' : undefined
      }
    })
    .otherwise(() => async () => ({
      success: false,
      message: 'Unknown request type'
    }))

  return handler()
}

// Usage
const result = await processAuthRequest({
  type: 'login',
  email: 'user@example.com',
  password: 'secret123'
})
```

## Payment Processing

```typescript
interface Payment {
  amount: number
  currency: 'USD' | 'EUR' | 'GBP' | 'INR'
  method: 'card' | 'bank' | 'crypto'
  riskScore: number // 0-100
}

const processPayment = (payment: Payment): { approved: boolean; fee: number; message: string } => {
  const conversionRates = {
    USD: 1,
    EUR: 1.1,
    GBP: 1.25,
    INR: 0.012
  }

  const rate = conversionRates[payment.currency]
  const usdAmount = payment.amount * rate

  return match(true)
    .on(payment.riskScore > 80, () => ({
      approved: false,
      fee: 0,
      message: 'Transaction flagged for fraud review'
    }))
    .on(usdAmount > 5000 && payment.method === 'crypto', () => ({
      approved: false,
      fee: 0,
      message: 'Large crypto transactions require verification'
    }))
    .on(payment.method === 'card', () => ({
      approved: true,
      fee: Math.round(usdAmount * 0.029 * 100) / 100,
      message: 'Card payment approved'
    }))
    .on(payment.method === 'bank', () => ({
      approved: true,
      fee: Math.round(usdAmount * 0.01 * 100) / 100,
      message: 'Bank transfer approved'
    }))
    .on(payment.method === 'crypto', () => ({
      approved: true,
      fee: Math.round(usdAmount * 0.005 * 100) / 100,
      message: 'Crypto payment approved'
    }))
    .otherwise(() => ({
      approved: false,
      fee: 0,
      message: 'Payment method not supported'
    }))
}

const payment: Payment = { amount: 100, currency: 'USD', method: 'card', riskScore: 25 }
console.log(processPayment(payment))
// { approved: true, fee: 2.9, message: 'Card payment approved' }
```

## File Upload Processing

```typescript
interface FileUpload {
  filename: string
  mimeType: string
  size: number // in bytes
  isScanned: boolean
}

const validateFileUpload = (
  file: FileUpload
): { allowed: boolean; error?: string; message: string } => {
  const maxSizes = {
    'image/jpeg': 5 * 1024 * 1024,
    'image/png': 5 * 1024 * 1024,
    'application/pdf': 10 * 1024 * 1024,
    'application/json': 2 * 1024 * 1024,
    'text/plain': 1 * 1024 * 1024
  }

  return match(true)
    .on(!file.isScanned, () => ({
      allowed: false,
      error: 'FILE_NOT_SCANNED',
      message: 'File must be scanned for viruses'
    }))
    .on(!(file.mimeType in maxSizes), () => ({
      allowed: false,
      error: 'UNSUPPORTED_TYPE',
      message: `File type ${file.mimeType} is not supported`
    }))
    .on(file.size > (maxSizes[file.mimeType as keyof typeof maxSizes] || 0), () => ({
      allowed: false,
      error: 'FILE_TOO_LARGE',
      message: `File size exceeds maximum limit`
    }))
    .on(file.filename.length > 255, () => ({
      allowed: false,
      error: 'FILENAME_TOO_LONG',
      message: 'Filename must be less than 255 characters'
    }))
    .otherwise(() => ({
      allowed: true,
      message: 'File is valid and ready for upload'
    }))
}

const file: FileUpload = {
  filename: 'image.jpg',
  mimeType: 'image/jpeg',
  size: 2000000,
  isScanned: true
}
console.log(validateFileUpload(file))
// { allowed: true, message: 'File is valid and ready for upload' }
```

## Content Moderation

```typescript
interface Content {
  type: 'text' | 'image' | 'video' | 'audio'
  text?: string
  flaggedWords: string[]
  autoModScore: number // 0-100
  userReports: number
}

const moderateContent = (
  content: Content
): { status: 'approved' | 'pending' | 'rejected'; reason?: string } => {
  return match(true)
    .on(content.userReports >= 5, () => ({
      status: 'rejected' as const,
      reason: 'Multiple user reports'
    }))
    .on(content.flaggedWords.length > 3, () => ({
      status: 'pending' as const,
      reason: 'Contains flagged content - needs review'
    }))
    .on(content.autoModScore > 80, () => ({
      status: 'rejected' as const,
      reason: 'High moderation score detected'
    }))
    .on(content.autoModScore > 50, () => ({
      status: 'pending' as const,
      reason: 'Requires manual review'
    }))
    .on(content.type === 'video' && content.autoModScore > 30, () => ({
      status: 'pending' as const,
      reason: 'Video content flagged for review'
    }))
    .otherwise(() => ({
      status: 'approved' as const
    }))
}

const content: Content = {
  type: 'text',
  text: 'Hello world',
  flaggedWords: [],
  autoModScore: 10,
  userReports: 0
}
console.log(moderateContent(content))
// { status: 'approved' }
```

## Feature Flags and A/B Testing

```typescript
interface User {
  id: string
  tier: 'free' | 'premium' | 'enterprise'
  region: 'us' | 'eu' | 'asia'
  cohort: 'control' | 'variant_a' | 'variant_b'
}

const getFeatureFlags = (user: User): Record<string, boolean> => {
  const premiumFeatures = match(user.tier)
    .on('free', () => ({
      newSearch: false,
      advancedAnalytics: false,
      customDashboard: false,
      apiAccess: false
    }))
    .on('premium', () => ({
      newSearch: true,
      advancedAnalytics: true,
      customDashboard: true,
      apiAccess: false
    }))
    .on('enterprise', () => ({
      newSearch: true,
      advancedAnalytics: true,
      customDashboard: true,
      apiAccess: true
    }))
    .otherwise(() => ({}))

  const regionalFeatures = match(user.region)
    .on('us', () => ({ localPayment: true }))
    .on('eu', () => ({ gdprCompliant: true }))
    .on('asia', () => ({ localPayment: true }))
    .otherwise(() => ({}))

  const abTestFeatures = match(user.cohort)
    .on('control', () => ({ newUi: false }))
    .on('variant_a', () => ({ newUi: true, darkMode: false }))
    .on('variant_b', () => ({ newUi: true, darkMode: true }))
    .otherwise(() => ({}))

  return {
    ...premiumFeatures,
    ...regionalFeatures,
    ...abTestFeatures
  }
}

const user: User = { id: 'u1', tier: 'premium', region: 'eu', cohort: 'variant_a' }
console.log(getFeatureFlags(user))
// {
//   newSearch: true,
//   advancedAnalytics: true,
//   customDashboard: true,
//   apiAccess: false,
//   gdprCompliant: true,
//   newUi: true,
//   darkMode: false
// }
```

## Next Steps

- [API Reference](/api/) - Complete API documentation
- [Guide](/guide/) - Learn more about advanced patterns
