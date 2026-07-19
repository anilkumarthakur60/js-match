import { defineConfig } from 'vitest/config'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const here = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(here, 'src')
    }
  },
  test: {
    include: ['test/**/*.test.ts'],
    environment: 'node',
    // The suite was migrated from Jest and relies on bare `describe`/`it`/
    // `expect`, so keep them global rather than rewriting every file.
    globals: true,
    reporters: ['default'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['test/**', '**/*.d.ts', 'dist/**', 'src/index.ts', 'src/types.ts'],
      thresholds: {
        // The suite was at 100% on Jest before the move; hold that line.
        lines: 100,
        statements: 100,
        functions: 100,
        branches: 100
      }
    }
  }
})
