# HTTP Status Codes

Handling HTTP status codes with match expressions.

## Basic Status Handling

```typescript
import { match } from '@anilkumarthakur/match'

const getStatusText = (code: number): string => {
  return match(code)
    .on(200, () => 'OK')
    .on(201, () => 'Created')
    .on(204, () => 'No Content')
    .on(301, () => 'Moved Permanently')
    .on(302, () => 'Found')
    .on(304, () => 'Not Modified')
    .on(400, () => 'Bad Request')
    .on(401, () => 'Unauthorized')
    .on(403, () => 'Forbidden')
    .on(404, () => 'Not Found')
    .on(500, () => 'Internal Server Error')
    .on(502, () => 'Bad Gateway')
    .on(503, () => 'Service Unavailable')
    .otherwise(() => 'Unknown Status')
}

console.log(getStatusText(200)) // "OK"
console.log(getStatusText(404)) // "Not Found"
```

## Status Categories

```typescript
type StatusCategory = 'success' | 'redirect' | 'client_error' | 'server_error'

const getStatusCategory = (code: number): StatusCategory => {
  return match(Math.floor(code / 100))
    .on(2, () => 'success')
    .on(3, () => 'redirect')
    .on(4, () => 'client_error')
    .on(5, () => 'server_error')
    .otherwise(() => 'unknown') as StatusCategory
}

console.log(getStatusCategory(200)) // "success"
console.log(getStatusCategory(404)) // "client_error"
console.log(getStatusCategory(503)) // "server_error"
```

## Detailed Response Handler

```typescript
interface HttpResponse {
  code: number
  message: string
  retry: boolean
  cacheTime: number
  logLevel: 'info' | 'warn' | 'error'
}

const handleHttpStatus = (code: number): HttpResponse => {
  return match(code)
    .onAny([200, 201, 202, 204], () => ({
      code,
      message: 'Success',
      retry: false,
      cacheTime: 3600,
      logLevel: 'info' as const
    }))
    .onAny([301, 302, 307], () => ({
      code,
      message: 'Redirect',
      retry: true,
      cacheTime: 0,
      logLevel: 'info' as const
    }))
    .on(304, () => ({
      code,
      message: 'Not Modified',
      retry: false,
      cacheTime: 0,
      logLevel: 'info' as const
    }))
    .on(400, () => ({
      code,
      message: 'Bad Request - Invalid input',
      retry: false,
      cacheTime: 0,
      logLevel: 'warn' as const
    }))
    .on(401, () => ({
      code,
      message: 'Unauthorized - Authentication required',
      retry: true,
      cacheTime: 0,
      logLevel: 'warn' as const
    }))
    .on(403, () => ({
      code,
      message: 'Forbidden - Insufficient permissions',
      retry: false,
      cacheTime: 0,
      logLevel: 'warn' as const
    }))
    .on(404, () => ({
      code,
      message: 'Not Found',
      retry: false,
      cacheTime: 0,
      logLevel: 'warn' as const
    }))
    .onAny([408, 429], () => ({
      code,
      message: 'Too many requests or timeout',
      retry: true,
      cacheTime: 0,
      logLevel: 'warn' as const
    }))
    .onAny([500, 502, 503, 504], () => ({
      code,
      message: 'Server Error',
      retry: true,
      cacheTime: 0,
      logLevel: 'error' as const
    }))
    .otherwise(() => ({
      code,
      message: 'Unknown Status',
      retry: true,
      cacheTime: 0,
      logLevel: 'error' as const
    }))
}

const response = handleHttpStatus(429)
console.log(response)
// {
//   code: 429,
//   message: 'Too many requests or timeout',
//   retry: true,
//   cacheTime: 0,
//   logLevel: 'error'
// }
```

## Response Action Handler

```typescript
interface ApiResponse<T = any> {
  status: number
  data?: T
  error?: string
}

const handleApiResponse = <T>(response: ApiResponse<T>): string => {
  return match(response.status)
    .onAny([200, 201, 202], () => {
      console.log('Success:', response.data)
      return 'success'
    })
    .on(204, () => {
      console.log('No content')
      return 'no_content'
    })
    .onAny([301, 302, 307], () => {
      console.log('Redirect')
      return 'redirect'
    })
    .on(400, () => {
      console.error('Bad request:', response.error)
      return 'error_bad_request'
    })
    .on(401, () => {
      console.error('Unauthorized - refresh token')
      return 'error_unauthorized'
    })
    .on(403, () => {
      console.error('Forbidden:', response.error)
      return 'error_forbidden'
    })
    .on(404, () => {
      console.error('Not found')
      return 'error_not_found'
    })
    .on(429, () => {
      console.warn('Rate limited - retry later')
      return 'error_rate_limited'
    })
    .onAny([500, 502, 503], () => {
      console.error('Server error:', response.error)
      return 'error_server'
    })
    .otherwise(() => {
      console.error('Unknown error:', response.error)
      return 'error_unknown'
    })
}

const response1: ApiResponse<{ id: number }> = {
  status: 200,
  data: { id: 1 }
}

const response2: ApiResponse = {
  status: 404,
  error: 'Resource not found'
}

console.log(handleApiResponse(response1)) // "success"
console.log(handleApiResponse(response2)) // "error_not_found"
```

## Status Code Utilities

```typescript
const isSuccess = (code: number): boolean => {
  return match(code)
    .onAny([200, 201, 202, 204], () => true)
    .otherwise(() => false)
}

const isRedirect = (code: number): boolean => {
  return match(code)
    .onAny([301, 302, 303, 307, 308], () => true)
    .otherwise(() => false)
}

const isClientError = (code: number): boolean => {
  return match(code)
    .onAny([400, 401, 403, 404, 408, 409, 429], () => true)
    .otherwise(() => false)
}

const isServerError = (code: number): boolean => {
  return match(code)
    .onAny([500, 502, 503, 504], () => true)
    .otherwise(() => false)
}

console.log(isSuccess(200)) // true
console.log(isClientError(404)) // true
console.log(isServerError(500)) // true
```

## Next Examples

- [Nested Matching](/examples/nested-matching)
- [Conditional Logic](/examples/conditional-logic)
- [Real-World Use Cases](/examples/real-world)
