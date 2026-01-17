/**
 * @anilkumarthakur/match - PHP-style match expressions for JavaScript/TypeScript
 *
 * A lightweight library providing PHP match() expression functionality with
 * full TypeScript support, 100% test coverage, and zero dependencies.
 *
 * @example Basic Usage
 * ```typescript
 * import { match } from '@anilkumarthakur/match'
 *
 * const result = match('success')
 *   .on('success', () => 'Operation successful!')
 *   .on('error', () => 'Something went wrong')
 *   .otherwise(() => 'Unknown status')
 * ```
 *
 * @example Multiple Values
 * ```typescript
 * const status = match(code)
 *   .onAny([200, 201, 202], () => 'Success')
 *   .onAny([400, 401, 403], () => 'Client Error')
 *   .otherwise(() => 'Unknown')
 * ```
 *
 * @packageDocumentation
 */

export { match, Matcher } from './matcher'
export { UnhandledMatchError } from './errors'
export type { Handler, MatchChain, MatcherHandler, Predicate } from './types'
