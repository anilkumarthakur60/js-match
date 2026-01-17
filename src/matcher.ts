import type { Handler } from './types'
import { UnhandledMatchError } from './errors'

/**
 * Matcher class implementing PHP-style match expressions for TypeScript/JavaScript
 * Supports exhaustive matching with type safety and O(1) lookup performance
 */
export class Matcher<TSubject, TResult> {
  private readonly subject: TSubject
  private readonly matches: Map<TSubject, Handler<TResult>> = new Map()
  private defaultHandler?: Handler<TResult>

  constructor(subject: TSubject) {
    this.subject = subject
  }

  on(value: TSubject, handler: Handler<TResult>): this {
    this.matches.set(value, handler)
    return this
  }

  onAny(values: readonly TSubject[], handler: Handler<TResult>): this {
    values.forEach((value) => this.matches.set(value, handler))
    return this
  }

  otherwise(handler: Handler<TResult>): TResult {
    this.defaultHandler = handler
    return this.evaluate()
  }

  default(handler: Handler<TResult>): TResult {
    return this.otherwise(handler)
  }

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

export function match<TSubject, TResult = unknown>(subject: TSubject): Matcher<TSubject, TResult> {
  return new Matcher<TSubject, TResult>(subject)
}
