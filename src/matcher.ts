import type { Handler, Predicate } from './types'
import { UnhandledMatchError } from './errors'

/**
 * Matcher class implementing PHP-style match expressions for TypeScript/JavaScript
 * Supports exhaustive matching with type safety and eager execution.
 *
 * When a match is found via `.on()` or `.onAny()`, the handler executes immediately
 * (PHP-like behavior). Subsequent `.on()` calls are no-ops once matched.
 *
 * Supports both literal value matching and predicate/guard functions for
 * flexible conditional logic.
 */
export class Matcher<TSubject, TResult> {
  private readonly subject: TSubject
  private matched: boolean = false
  private result: TResult | undefined = undefined

  constructor(subject: TSubject) {
    this.subject = subject
  }

  /**
   * Match against a literal value or predicate function
   *
   * @param pattern - A literal value to match with Object.is, OR a predicate function (subject) => boolean
   * @param handler - Function to execute if matched
   *
   * @example Literal matching
   * ```typescript
   * match('hello').on('hello', () => 'matched')
   * ```
   *
   * @example Predicate matching
   * ```typescript
   * match(10).on((n) => n > 5, () => 'greater than 5')
   * ```
   */
  on(pattern: TSubject | Predicate<TSubject>, handler: Handler<TResult>): this {
    if (this.matched) return this

    // Treat pattern as predicate only if:
    // 1. Pattern is a function, AND
    // 2. Subject is NOT a function (to allow matching function references literally)
    const isPredicate = typeof pattern === 'function' && typeof this.subject !== 'function'

    const isMatch = isPredicate
      ? (pattern as Predicate<TSubject>)(this.subject)
      : Object.is(this.subject, pattern)

    if (isMatch) {
      this.matched = true
      this.result = handler()
    }
    return this
  }

  /**
   * Match against any of the provided literal values
   *
   * @param values - Array of literal values to match against
   * @param handler - Function to execute if any value matches
   */
  onAny(values: readonly TSubject[], handler: Handler<TResult>): this {
    if (this.matched) return this

    if (values.some((v) => Object.is(this.subject, v))) {
      this.matched = true
      this.result = handler()
    }
    return this
  }

  /**
   * Provide a fallback handler if no cases matched
   *
   * @param handler - Function to execute if no cases matched
   * @returns The result from matched handler or fallback
   */
  otherwise(handler: Handler<TResult>): TResult {
    if (!this.matched) {
      return handler()
    }
    return this.result as TResult
  }

  /**
   * Alias for otherwise() - PHP compatibility
   */
  default(handler: Handler<TResult>): TResult {
    return this.otherwise(handler)
  }

  /**
   * Get the matched result without a fallback
   *
   * @throws {UnhandledMatchError} If no match was found
   * @returns The result from the matched handler
   */
  valueOf(): TResult {
    if (!this.matched) {
      throw new UnhandledMatchError(this.subject)
    }
    return this.result as TResult
  }

  /**
   * Execute the match chain for side effects only
   *
   * Useful when you only care about side effects and want to know if a match occurred.
   *
   * @returns true if a match was found, false otherwise
   *
   * @example
   * ```typescript
   * const didMatch = match(action)
   *   .on('save', () => saveData())
   *   .on('delete', () => deleteData())
   *   .run()
   * ```
   */
  run(): boolean {
    return this.matched
  }

  /**
   * Check if a match has been found
   */
  get isMatched(): boolean {
    return this.matched
  }
}

export function match<TSubject, TResult = unknown>(subject: TSubject): Matcher<TSubject, TResult> {
  return new Matcher<TSubject, TResult>(subject)
}
