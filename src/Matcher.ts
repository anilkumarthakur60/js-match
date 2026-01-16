import type { MatcherHandler } from './types/main'

/**
 * Error thrown when a match expression has no matching case and no default handler
 *
 * @class UnhandledMatchError
 * @extends Error
 *
 * @example
 * try {
 *   match('foo')
 *     .on('bar', () => 'never matches')
 *     .valueOf()
 * } catch (error) {
 *   if (error instanceof UnhandledMatchError) {
 *     console.error('No match found')
 *   }
 * }
 */
class UnhandledMatchError extends Error {
  /**
   * Create an UnhandledMatchError
   *
   * @param {unknown} value The value that could not be matched
   */
  constructor(value: unknown) {
    super(`Unhandled match value: ${JSON.stringify(value)}`)
    this.name = 'UnhandledMatchError'
  }
}

/**
 * Matcher class implementing PHP-style match expressions for TypeScript/JavaScript
 * Supports exhaustive matching with type safety and O(1) lookup performance
 *
 * @template TSubject The type of values being matched against
 * @template TResult The return type of the match expression
 *
 * @class Matcher
 *
 * @example
 * ```typescript
 * const result = match('foo')
 *   .on('foo', () => 'matched foo')
 *   .on('bar', () => 'matched bar')
 *   .otherwise(() => 'default')
 * ```
 *
 * @example HTTP Status Codes
 * ```typescript
 * const message = match(statusCode)
 *   .on(200, () => 'OK')
 *   .onAny([201, 202], () => 'Accepted')
 *   .on(404, () => 'Not Found')
 *   .otherwise(() => 'Unknown')
 * ```
 */
class Matcher<TSubject, TResult> {
  /**
   * The value being matched against
   * @private
   */
  private readonly subject: TSubject

  /**
   * Map of values to their corresponding handler functions
   * Uses Map for O(1) lookup performance
   * @private
   */
  private readonly matches: Map<TSubject, MatcherHandler<TResult>> = new Map()

  /**
   * Default handler to execute if no cases match
   * @private
   */
  private defaultHandler?: MatcherHandler<TResult>

  /**
   * Create a new Matcher instance
   *
   * @param {TSubject} subject The value to match against
   *
   * @internal Use the `match()` function instead of instantiating directly
   */
  constructor(subject: TSubject) {
    this.subject = subject
  }

  /**
   * Add a case to match against the subject
   * Uses strict equality (===) for comparison
   *
   * @param {TSubject} value The value to match against
   * @param {MatcherHandler<TResult>} handler Function to execute if this value matches
   * @returns {this} The matcher instance for method chaining
   *
   * @example
   * ```typescript
   * match('hello')
   *   .on('hello', () => 'matched')
   *   .on('goodbye', () => 'not matched')
   * ```
   */
  on(value: TSubject, handler: MatcherHandler<TResult>): this {
    this.matches.set(value, handler)
    return this
  }

  /**
   * Add multiple values that map to the same handler
   * Simulates PHP's comma-separated case syntax
   *
   * @param {readonly TSubject[]} values Array of values to match
   * @param {MatcherHandler<TResult>} handler Function to execute if any value matches
   * @returns {this} The matcher instance for method chaining
   *
   * @example HTTP Status Codes
   * ```typescript
   * match(statusCode)
   *   .onAny([200, 201, 202], () => 'Success')
   *   .onAny([400, 401, 403], () => 'Client Error')
   *   .otherwise(() => 'Unknown')
   * ```
   *
   * @see on For matching a single value
   */
  onAny(values: readonly TSubject[], handler: MatcherHandler<TResult>): this {
    values.forEach((value) => this.matches.set(value, handler))
    return this
  }

  /**
   * Set the default handler and execute the match expression
   * This method triggers evaluation of all accumulated cases
   *
   * @param {MatcherHandler<TResult>} handler Function to execute if no cases match
   * @returns {TResult} The result from the matched handler or the default handler
   * @throws {UnhandledMatchError} If no case matches and no handler catches it
   *
   * @example
   * ```typescript
   * const result = match(status)
   *   .on('active', () => 'Active')
   *   .on('inactive', () => 'Inactive')
   *   .otherwise(() => 'Unknown status')
   * ```
   *
   * @see default For PHP-compatible alias
   * @see valueOf For executing without a default handler
   */
  otherwise(handler: MatcherHandler<TResult>): TResult {
    this.defaultHandler = handler
    return this.evaluate()
  }

  /**
   * PHP-compatible alias for otherwise()
   * Identical behavior - sets default handler and executes
   *
   * @param {MatcherHandler<TResult>} handler Function to execute if no cases match
   * @returns {TResult} The result from the matched handler or the default handler
   * @throws {UnhandledMatchError} If no case matches
   *
   * @example
   * ```typescript
   * // PHP-style syntax
   * const result = match(value)
   *   .on('case1', () => 'Result1')
   *   .default(() => 'Default')
   * ```
   *
   * @see otherwise For the standard method
   */
  default(handler: MatcherHandler<TResult>): TResult {
    return this.otherwise(handler)
  }

  /**
   * Execute the match expression without a default handler
   * Throws if no case matches
   *
   * @returns {TResult} The result from the matched handler
   * @throws {UnhandledMatchError} If no case matches
   *
   * @example
   * ```typescript
   * try {
   *   const result = match(code)
   *     .on(200, () => 'OK')
   *     .on(404, () => 'Not Found')
   *     .valueOf() // Must have matched
   * } catch (error) {
   *   if (error instanceof UnhandledMatchError) {
   *     console.error('Invalid code:', error.message)
   *   }
   * }
   * ```
   *
   * @see otherwise For safe execution with default handler
   */
  valueOf(): TResult {
    return this.evaluate()
  }

  /**
   * Evaluate the match expression by finding the matching case
   *
   * @private
   * @returns {TResult} The result from matched handler or default
   * @throws {UnhandledMatchError} If no match and no default handler
   */
  private evaluate(): TResult {
    if (this.matches.has(this.subject)) {
      return this.matches.get(this.subject)!()
    } else if (this.defaultHandler) {
      return this.defaultHandler()
    }
    throw new UnhandledMatchError(this.subject)
  }
}

/**
 * Create a new PHP-style match expression
 *
 * @template TSubject The type of the value being matched
 * @template TResult The return type of the match expression handlers
 *
 * @param {TSubject} subject The value to match against (any type)
 * @returns {Matcher<TSubject, TResult>} A Matcher instance for method chaining
 *
 * @example Basic String Matching
 * ```typescript
 * const status = match(statusCode)
 *   .on(200, () => 'success')
 *   .on(404, () => 'not found')
 *   .otherwise(() => 'error')
 * ```
 *
 * @example HTTP Status Codes
 * ```typescript
 * const message = match(code)
 *   .onAny([200, 201, 202], () => 'Success')
 *   .onAny([400, 401, 403], () => 'Client Error')
 *   .on(500, () => 'Server Error')
 *   .otherwise(() => 'Unknown')
 * ```
 *
 * @example Conditional Logic
 * ```typescript
 * const result = match(true)
 *   .on(age < 18, () => 'Minor')
 *   .on(age >= 18 && age < 65, () => 'Adult')
 *   .on(age >= 65, () => 'Senior')
 *   .otherwise(() => 'Unknown')
 * ```
 *
 * @see Matcher For complete API documentation
 */
function match<TSubject, TResult>(subject: TSubject): Matcher<TSubject, TResult> {
  return new Matcher<TSubject, TResult>(subject)
}

export { match, UnhandledMatchError, Matcher }
