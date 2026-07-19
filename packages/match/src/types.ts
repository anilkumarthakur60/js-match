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
 * Predicate function type for guard/conditional matching
 *
 * A predicate is a function that takes the subject value and returns a boolean
 * indicating whether the match condition is satisfied.
 *
 * @template T The type of the subject being matched
 *
 * @example
 * ```typescript
 * const isPositive: Predicate<number> = (n) => n > 0
 * const isString: Predicate<unknown> = (v) => typeof v === 'string'
 * ```
 */
export type Predicate<T> = (value: T) => boolean

/**
 * Alias for Handler<T>
 *
 * @template T The return type of the handler function
 * @deprecated Use Handler<T> instead
 */
export type MatcherHandler<T> = Handler<T>

/**
 * The set of patterns `.on()` accepts for a given subject type.
 *
 * This mirrors the runtime rule in `Matcher#on`: a function pattern is only
 * invoked as a predicate when the subject is *not* itself a function, because
 * a function subject must stay matchable by identity. Advertising the predicate
 * arm for function subjects would typecheck code that can never match at
 * runtime (the predicate is never called and the case silently falls through),
 * so the predicate arm is withdrawn there and the pattern must be the function.
 *
 * The check is wrapped in a tuple so it does not distribute: for a union
 * subject like `string | (() => void)` the runtime decision depends on the
 * value rather than the declared type, so both arms have to stay available.
 *
 * @template TSubject The type of the value being matched against
 *
 * @example
 * ```typescript
 * type P1 = Pattern<number>       // number | Predicate<number>
 * type P2 = Pattern<() => string> // () => string  (no predicate arm)
 * ```
 */
export type Pattern<TSubject> = [TSubject] extends [(...args: never[]) => unknown]
  ? TSubject
  : TSubject | Predicate<TSubject>

/**
 * Whether a chain's result type was pinned by the consumer.
 *
 * A chain that starts life as `match<S, R>(subject)` has its result type fixed
 * up front; one that starts as `match(subject)` starts at `never` and infers.
 * The distinction has to be captured at the start of the chain, because once a
 * handler has contributed a type the accumulated TResult is no longer `never`
 * and the two cases would otherwise be indistinguishable.
 *
 * @template TResult The result type the chain was created with
 */
export type IsPinned<TResult> = [TResult] extends [never] ? false : true

/**
 * The handler type a chain accepts.
 *
 * On an inferring chain the handler's return type is an inference site, so `R`
 * is captured and unioned into the chain's result type — that is what makes
 * `match('a').on('a', () => 42).otherwise(() => 0)` resolve to `number` instead
 * of `unknown`, and what turns a chain of disagreeing handlers into a union.
 *
 * On a pinned chain every handler is checked against the annotation instead, so
 * a handler returning the wrong type is a compile error rather than a silent
 * widening. That keeps the explicit two-type-argument form behaving as before.
 *
 * @template TResult The result type accumulated so far
 * @template R The return type inferred from this handler
 * @template TPinned Whether the chain's result type was pinned by the consumer
 */
export type ResultHandler<
  TResult,
  R,
  TPinned extends boolean = IsPinned<TResult>
> = TPinned extends true ? Handler<TResult> : Handler<R>

/**
 * Interface representing a chainable match expression
 *
 * Provides the API contract for method chaining in match expressions. It
 * describes the complete surface of the `Matcher` class, which declares
 * `implements MatchChain<TSubject, TResult>` so the compiler catches any future
 * drift between the published contract and the shipped class.
 *
 * @template TSubject The type of the value being matched against
 * @template TResult The accumulated return type of handler functions. Leave it
 *   at its `never` default to have handler return types inferred.
 * @template TPinned Internal: whether TResult was pinned by the consumer rather
 *   than inferred. It is derived from TResult and should not be passed by hand.
 *
 * @example
 * ```typescript
 * // Inferred result type — the handlers decide it.
 * const chain: MatchChain<string> = match('a').on('a', () => 1)
 *
 * // Pinned result type — every handler must return number.
 * const pinned: MatchChain<string, number> = match<string, number>('a')
 * ```
 */
export interface MatchChain<
  TSubject,
  TResult = never,
  TPinned extends boolean = IsPinned<TResult>
> {
  /**
   * Alias for otherwise() - PHP compatibility
   *
   * @param handler Function to execute if no cases match
   * @returns The result from matched handler or default
   */
  default: <R = never>(handler: ResultHandler<TResult, R, TPinned>) => TResult | R

  /**
   * Get the matched result without a fallback
   *
   * @returns The result from the matched handler
   */
  get: () => TResult

  /**
   * Whether a match has been found
   */
  readonly isMatched: boolean

  /**
   * Add a case to match against the subject
   *
   * @param pattern A literal value to match with Object.is, or a predicate
   * @param handler Function to execute if matched
   * @returns The matcher for chaining, with this handler's return type folded in
   */
  on: <R = never>(
    pattern: Pattern<TSubject>,
    handler: ResultHandler<TResult, R, TPinned>
  ) => MatchChain<TSubject, TResult | R, TPinned>

  /**
   * Match against any of the provided literal values
   *
   * @param values Array of literal values to match against
   * @param handler Function to execute if any value matches
   * @returns The matcher for chaining, with this handler's return type folded in
   */
  onAny: <R = never>(
    values: readonly TSubject[],
    handler: ResultHandler<TResult, R, TPinned>
  ) => MatchChain<TSubject, TResult | R, TPinned>

  /**
   * Set default handler and execute the match
   *
   * @param handler Function to execute if no cases match
   * @returns The result from matched handler or default
   */
  otherwise: <R = never>(handler: ResultHandler<TResult, R, TPinned>) => TResult | R

  /**
   * Execute the match chain for side effects only
   *
   * @returns true if a match was found, false otherwise
   */
  run: () => boolean

  /**
   * Deprecated alias for `get()`
   *
   * @deprecated Use `get()`. `valueOf` is part of JS's ToPrimitive protocol, so
   *   it also runs on implicit coercion — see the note on `Matcher#valueOf`.
   * @returns The result from the matched handler
   */
  valueOf: () => TResult
}
