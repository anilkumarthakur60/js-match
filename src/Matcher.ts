type MatcherHandler<T> = () => T

class UnhandledMatchError extends Error {
  constructor(value: unknown) {
    super(`Unhandled match value: ${JSON.stringify(value)}`)
    this.name = 'UnhandledMatchError'
  }
}

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
    if (this.matches.has(this.subject)) {
      return this.matches.get(this.subject)!()
    } else if (this.defaultHandler) {
      return this.defaultHandler()
    }
    throw new UnhandledMatchError(this.subject)
  }
}

function match<TSubject, TResult>(subject: TSubject): Matcher<TSubject, TResult> {
  return new Matcher(subject)
}

export { match, UnhandledMatchError }
