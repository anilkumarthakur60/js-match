import { defineConfig } from 'tsup'

/**
 * Two build definitions in one file: the library (ESM + CJS with bundled
 * declarations) and a browser global for CDN use.
 *
 * tsup *bundles* declarations into one file per entry, so the emitted `.d.ts`
 * carries no internal relative specifiers. That matters: extensionless
 * relative specifiers are illegal under `moduleResolution: "node16"`, and
 * because almost every consumer runs `skipLibCheck: true` the diagnostic is
 * swallowed while resolution still fails — silently degrading the whole public
 * API to `any`. `scripts/check-dist.mjs` asserts this stays true.
 *
 * No sourcemaps: they would dominate the tarball of a library this small, they
 * do not affect consumers' bundle size (bundlers strip them), and the test
 * suite runs against `src` rather than `dist`.
 */
export default defineConfig([
  {
    entry: { index: 'src/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    tsconfig: 'tsconfig.tsup.json',
    sourcemap: false,
    clean: true,
    treeshake: true,
    target: 'es2022',
    outDir: 'dist'
  },
  {
    entry: { index: 'src/index.ts' },
    format: ['iife'],
    globalName: 'JsMatch',
    // The library build owns `clean`; this pass must not wipe it.
    clean: false,
    dts: false,
    sourcemap: false,
    treeshake: true,
    target: 'es2022',
    outDir: 'dist',
    outExtension: () => ({ js: '.global.js' })
  }
])
