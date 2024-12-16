// export type Match<T, U> = {
//   predicate: (val: T) => boolean
//   action: () => U
// }

export type Handler<T> = () => T

export interface MatchChain<T> {
  on: (value: any, handler: Handler<T>) => MatchChain<T>
  otherwise: (handler: Handler<T>) => T
}
