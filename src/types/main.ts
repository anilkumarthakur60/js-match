/**
 * Handler function type - returns a value of type T
 */
export type Handler<T> = () => T

/**
 * MatchChain interface for method chaining pattern
 */
export interface MatchChain<TSubject, TResult> {
  on: (value: TSubject, handler: Handler<TResult>) => MatchChain<TSubject, TResult>
  otherwise: (handler: Handler<TResult>) => TResult
}
