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

The package's `unpkg` and `jsdelivr` fields both point at `dist/index.global.js`, so the bare
specifier resolves to the browser build and everything lands on the `JsMatch` global:

```html
<script src="https://unpkg.com/@anilkumarthakur/match"></script>
<script>
  const { match } = JsMatch
</script>
```

## Browser Support

Works in all modern browsers, and the build targets ES2022. The published `engines.node` range is
`>=22`; installing on Node 20 or older fails with `EBADENGINE` (npm) or
`ERR_PNPM_UNSUPPORTED_ENGINE` (pnpm). The floor tracks Node.js LTS — it is the oldest LTS line still
in maintenance and rises as older lines reach end-of-life — so the supported runtimes are:

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Node.js 22+ (active LTS lines)

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

### IIFE / browser global

There is **no UMD build** — the browser bundle is a bare IIFE with no AMD or CommonJS detection. It
ships as `dist/index.global.js` and assigns the `JsMatch` global:

```html
<script src="https://unpkg.com/@anilkumarthakur/match/dist/index.global.js"></script>
<script>
  const { match, Matcher, UnhandledMatchError } = JsMatch
</script>
```

## TypeScript Setup

The package comes with complete TypeScript definitions. No additional installation needed!

```typescript
import { match, type Handler, type MatchChain } from '@anilkumarthakur/match'

// Result type inferred from the handlers — `result` is number
const result = match('test')
  .on('test', () => 123)
  .otherwise(() => 456)

// Or pin it explicitly, and every handler is checked against that one type
const pinned = match<string, number>('test')
  .on('test', () => 123)
  .otherwise(() => 456)
```
