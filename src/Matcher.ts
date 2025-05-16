type MatcherHandler<T> = () => T

class Matcher<TSubject, TResult> {
  private subject: TSubject
  private matches: Map<TSubject, MatcherHandler<TResult>> = new Map()
  private defaultHandler?: MatcherHandler<TResult>

  constructor(subject: TSubject) {
    this.subject = subject
  }

  on(value: TSubject, handler: MatcherHandler<TResult>): this {
    this.matches.set(value, handler)
    return this
  }

  otherwise(handler: MatcherHandler<TResult>): TResult {
    this.defaultHandler = handler
    // Try to match now and return result
    if (this.matches.has(this.subject)) {
      return this.matches.get(this.subject)!()
    } else if (this.defaultHandler) {
      return this.defaultHandler()
    }
    throw new Error('Unhandled match value and no default provided')
  }
}

function match<TSubject, TResult>(subject: TSubject): Matcher<TSubject, TResult> {
  return new Matcher(subject)
}

export { match }
