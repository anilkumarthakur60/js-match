type MatcherHandler<T> = () => T

class UnhandledMatchError extends Error {
  constructor(value: unknown) {
    super(`Unhandled match value: ${JSON.stringify(value)}`)
    this.name = 'UnhandledMatchError'
  }
}

/**
 * Matcher class implementing PHP-style match expressions for TypeScript/JavaScript
 * Supports exhaustive matching with type safety
 *
 * @example
 * const result = match('foo')
 *   .on('foo', () => 'matched foo')
 *   .on('bar', () => 'matched bar')
 *   .otherwise(() => 'default')
 */
class Matcher<TSubject, TResult> {
  private readonly subject: TSubject
  private readonly matches: Map<TSubject, MatcherHandler<TResult>> = new Map()
  private defaultHandler?: MatcherHandler<TResult>

  constructor(subject: TSubject) {
    this.subject = subject
  }

  /**
   * Add a case to match against
   * @param value The value to match
   * @param handler Function to execute if matched
   * @returns this for method chaining
   */
  on(value: TSubject, handler: MatcherHandler<TResult>): this {
    this.matches.set(value, handler)
    return this
  }

  /**
   * Add multiple values to match in one call
   * Useful for matching similar cases
   *
   * @example
   * .onAny(['foo', 'bar'], () => 'matched foo or bar')
   */
  onAny(values: readonly TSubject[], handler: MatcherHandler<TResult>): this {
    values.forEach((value) => this.matches.set(value, handler))
    return this
  }

  /**
   * Set the default handler and execute the match
   * @param handler Function to execute if no cases match
   * @returns The result from matched handler or default handler
   * @throws UnhandledMatchError if no match found and no default provided
   */
  otherwise(handler: MatcherHandler<TResult>): TResult {
    this.defaultHandler = handler
    return this.evaluate()
  }

  /**
   * Alias for otherwise() - PHP compatibility
   */
  default(handler: MatcherHandler<TResult>): TResult {
    return this.otherwise(handler)
  }

  /**
   * Execute the match without a default handler
   * @returns The result from matched handler
   * @throws UnhandledMatchError if no match found
   */
  valueOf(): TResult {
    return this.evaluate()
  }

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
 * Create a new match expression
 * @param subject The value to match against
 * @returns Matcher instance for method chaining
 *
 * @example
 * const status = match(statusCode)
 *   .on(200, () => 'success')
 *   .on(404, () => 'not found')
 *   .otherwise(() => 'error')
 */
function match<TSubject, TResult>(subject: TSubject): Matcher<TSubject, TResult> {
  return new Matcher<TSubject, TResult>(subject)
}

export { match, UnhandledMatchError, Matcher }
export type { MatcherHandler }
