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

import { match } from './match'

/**
 * Create a new match expression
 *
 * @template TSubject The type of the value being matched
 * @template TResult The return type of handler functions
 *
 * @param {TSubject} subject The value to match against
 * @returns {Matcher<TSubject, TResult>} A Matcher instance
 *
 * @see {@link Matcher} For complete API documentation
 */
export { match }

/**
 * Core classes and types for the match expression library
 */
export { Matcher, UnhandledMatchError } from './Matcher'

/**
 * Type for match handler functions
 *
 * @template T The return type of the handler
 *
 * @example
 * ```typescript
 * const handler: Handler<string> = () => 'result'
 * ```
 */
export type { Handler, MatchChain, MatcherHandler } from './types/main'
