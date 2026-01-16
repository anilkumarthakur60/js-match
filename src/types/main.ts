/**
 * Internal handler function type for match expression results
 *
 * Used internally by the Matcher class to store and execute handler functions.
 * This is an alias for Handler<T> with the same signature.
 *
 * @template T The return type of the handler function
 *
 * @internal Internal use only
 */
export type MatcherHandler<T> = () => T

/**
 * Handler function type for match expression results
 *
 * A handler is a function that takes no parameters and returns a value
 * of type T. Used in match expressions to define what happens when a case matches.
 *
 * @template T The return type of the handler function
 *
 * @example
 * ```typescript
 * const handler: Handler<string> = () => 'matched'
 * const numHandler: Handler<number> = () => 42
 * ```
 */
export type Handler<T> = () => T

/**
 * Interface representing a chainable match expression
 *
 * Provides the API contract for method chaining in match expressions.
 * Implementations should support fluent interface patterns.
 *
 * @template TSubject The type of the value being matched against
 * @template TResult The return type of handler functions
 *
 * @example
 * ```typescript
 * interface MatchChain<string, number> {
 *   on: (value: string, handler: Handler<number>) => MatchChain<string, number>
 *   otherwise: (handler: Handler<number>) => number
 * }
 * ```
 */
export interface MatchChain<TSubject, TResult> {
  /**
   * Add a case to match against the subject
   *
   * @param {TSubject} value The value to match
   * @param {Handler<TResult>} handler Function to execute if matched
   * @returns {MatchChain<TSubject, TResult>} The matcher for chaining
   */
  on: (value: TSubject, handler: Handler<TResult>) => MatchChain<TSubject, TResult>

  /**
   * Set default handler and execute the match
   *
   * @param {Handler<TResult>} handler Function to execute if no cases match
   * @returns {TResult} The result from matched handler or default
   */
  otherwise: (handler: Handler<TResult>) => TResult
}
