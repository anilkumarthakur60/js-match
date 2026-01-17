import type { Handler } from './types'
import { UnhandledMatchError } from './errors'

/**
 * Matcher class implementing PHP-style match expressions for TypeScript/JavaScript
 * Supports exhaustive matching with type safety and eager execution.
 *
 * When a match is found via `.on()` or `.onAny()`, the handler executes immediately
 * (PHP-like behavior). Subsequent `.on()` calls are no-ops once matched.
 */
export class Matcher<TSubject, TResult> {
  private readonly subject: TSubject
  private matched: boolean = false
  private result: TResult | undefined = undefined

  constructor(subject: TSubject) {
    this.subject = subject
  }

  on(value: TSubject, handler: Handler<TResult>): this {
    if (!this.matched && this.subject === value) {
      this.matched = true
      this.result = handler()
    }
    return this
  }

  onAny(values: readonly TSubject[], handler: Handler<TResult>): this {
    if (!this.matched && values.includes(this.subject)) {
      this.matched = true
      this.result = handler()
    }
    return this
  }

  otherwise(handler: Handler<TResult>): TResult {
    if (!this.matched) {
      return handler()
    }
    return this.result as TResult
  }

  default(handler: Handler<TResult>): TResult {
    return this.otherwise(handler)
  }

  valueOf(): TResult {
    if (!this.matched) {
      throw new UnhandledMatchError(this.subject)
    }
    return this.result as TResult
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
