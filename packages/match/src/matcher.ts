import type {
  IsPinned,
  MatchChain,
  NonExhaustive,
  Pattern,
  Predicate,
  ResultHandler,
  Unmatched
} from './types'
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
export class Matcher<
  TSubject,
  TResult = never,
  // Derived, never passed explicitly: it remembers whether the chain started
  // pinned (`match<S, R>(x)`) or inferring (`match(x)`), which TResult alone can
  // no longer tell you once a handler has contributed a type to it.
  TPinned extends boolean = IsPinned<TResult>,
  // Phantom, never passed explicitly: the subject values no arm has covered
  // yet. It exists purely so `exhaustive()` can refuse to compile while cases
  // are outstanding; nothing at runtime reads it.
  TRemaining = TSubject
> implements MatchChain<TSubject, TResult, TPinned, TRemaining> {
  private readonly subject: TSubject
  private matched = false
  // Stored as `unknown` because each handler contributes its own return type to
  // the accumulated TResult; the class field cannot name them all. Reads cast
  // back at the (typed) terminal accessors.
  private result: unknown = undefined

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
  // Deliberately not `this`: the return type folds this handler's R into
  // TResult so the chain accumulates its handlers' return types, and drops this
  // pattern from TRemaining so `exhaustive()` can tell when the arms are
  // complete. Both are phantom — the object returned is this very instance,
  // which is why prefer-return-this-type is suppressed here.
  on<const TPattern extends Pattern<TSubject>, R = never>(
    pattern: TPattern,
    handler: ResultHandler<TResult, R, TPinned>
    // eslint-disable-next-line @typescript-eslint/prefer-return-this-type
  ): Matcher<TSubject, TResult | R, TPinned, Unmatched<TSubject, TRemaining, TPattern>> {
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
  // See `on`: the widened return type is what accumulates the result union, and
  // every listed value is a literal, so all of them leave TRemaining.
  onAny<const TValues extends readonly TSubject[], R = never>(
    values: TValues,
    handler: ResultHandler<TResult, R, TPinned>
    // eslint-disable-next-line @typescript-eslint/prefer-return-this-type
  ): Matcher<TSubject, TResult | R, TPinned, Exclude<TRemaining, TValues[number]>> {
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
  otherwise<R = never>(handler: ResultHandler<TResult, R, TPinned>): TResult | R {
    if (!this.matched) {
      return handler()
    }
    return this.result as TResult | R
  }

  /**
   * Alias for otherwise() - PHP compatibility
   */
  default<R = never>(handler: ResultHandler<TResult, R, TPinned>): TResult | R {
    return this.otherwise<R>(handler)
  }

  /**
   * Resolve the chain, requiring at compile time that every case is covered.
   *
   * This is the checked counterpart to `get()`. Both throw on an unmatched
   * subject at runtime; the difference is that reaching `exhaustive()` at all
   * means the compiler has already confirmed no declared subject value is left
   * without an arm. Add a case to the union later and every `exhaustive()` chain
   * over it stops compiling — the failure moves from production to the build.
   *
   * The guarantee is only as good as the subject's declared type, which is why
   * it still throws: a value smuggled past the type system (an unvalidated API
   * payload, a cast) can reach a chain the compiler believes is total.
   *
   * Only literal arms count towards coverage. A chain that discriminates with
   * predicates keeps its full remainder and cannot call this — use
   * `otherwise()` there, since a guard's outcome is not knowable statically.
   *
   * @param _args Nothing, once no cases remain. While cases are still missing the
   *   signature demands one argument of an unconstructable type, so the call
   *   fails to compile; hover it to see which values are unhandled.
   * @throws {UnhandledMatchError} If no arm matched at runtime
   * @returns The result from the matched handler
   *
   * @example
   * ```typescript
   * type Status = 'active' | 'archived'
   *
   * const label = (status: Status): string =>
   *   match<Status, string>(status)
   *     .on('active', () => 'Live')
   *     .on('archived', () => 'Archived')
   *     .exhaustive()
   * ```
   */
  exhaustive(
    // Unused at runtime: the parameter exists only to make the call fail to
    // typecheck while TRemaining is inhabited. Prefixed so `noUnusedParameters`
    // and the lint rule both accept it.
    ..._args: [TRemaining] extends [never] ? [] : [error: NonExhaustive<TRemaining>]
  ): TResult {
    return this.get()
  }

  /**
   * Get the matched result without a fallback
   *
   * @throws {UnhandledMatchError} If no match was found
   * @returns The result from the matched handler
   */
  get(): TResult {
    if (!this.matched) {
      throw new UnhandledMatchError(this.subject)
    }
    return this.result as TResult
  }

  /**
   * Deprecated alias for {@link Matcher.get}
   *
   * `valueOf` is a slot in JS's ToPrimitive protocol, so the engine calls it on
   * any implicit coercion — `matcher + 1`, `matcher == x`, a sort comparator.
   * That makes an unmatched chain throw UnhandledMatchError from expressions
   * that never mention the method, and a matched chain leak its result into
   * arithmetic. The behaviour is kept for backwards compatibility, but reach
   * for `get()` so resolution is always explicit.
   *
   * @deprecated Use {@link Matcher.get} instead
   * @throws {UnhandledMatchError} If no match was found
   * @returns The result from the matched handler
   */
  valueOf(): TResult {
    return this.get()
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

/**
 * Start a match expression.
 *
 * The result type defaults to `never` rather than `unknown` so that each
 * handler's return type is an inference site and the chain accumulates their
 * union — `match('a').on('a', () => 42)` resolves to `number`, not `unknown`.
 * Passing both type arguments explicitly (`match<string, string>(x)`) still
 * pins every handler to that one type, as before.
 */
export function match<TSubject, TResult = never>(subject: TSubject): Matcher<TSubject, TResult> {
  return new Matcher<TSubject, TResult>(subject)
}
