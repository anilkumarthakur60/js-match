/**
 * Re-export module for backwards compatibility
 *
 * This module maintains backwards compatibility by re-exporting
 * from the main Matcher module. New code should import from
 * the root index.ts or directly from Matcher.ts
 *
 * @example
 * ```typescript
 * // Backwards compatible (legacy)
 * import { match } from './match'
 *
 * // Recommended
 * import { match } from '@anilkumarthakur/match'
 * ```
 */
export { match } from './Matcher'

/**
 * Re-export all types from the types module
 */
export type { MatchChain, Handler, MatcherHandler } from './types/main'
