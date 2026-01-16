# Installation

## npm

```bash
npm install @anilkumarthakur/match
```

## yarn

```bash
yarn add @anilkumarthakur/match
```

## pnpm

```bash
pnpm add @anilkumarthakur/match
```

## bun

```bash
bun add @anilkumarthakur/match
```

## From CDN

```html
<script src="https://unpkg.com/@anilkumarthakur/match"></script>
```

## Browser Support

Works in all modern browsers and Node.js 14+:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Node.js 14+

## Module Systems

The package supports multiple module systems:

### ESM (Recommended)

```typescript
import { match } from '@anilkumarthakur/match'
```

### CommonJS

```javascript
const { match } = require('@anilkumarthakur/match')
```

### UMD

```html
<script src="https://unpkg.com/@anilkumarthakur/match/dist/index.umd.js"></script>
<script>
  const { match } = window['@anilkumarthakur/match']
</script>
```

## TypeScript Setup

The package comes with complete TypeScript definitions. No additional installation needed!

```typescript
import { match, Handler, MatchChain } from '@anilkumarthakur/match'

// Full type safety out of the box
const result = match<string, number>('test')
  .on('test', () => 123)
  .otherwise(() => 456)
```
