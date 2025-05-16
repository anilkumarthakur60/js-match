// export type Match<T, U> = {
//   predicate: (val: T) => boolean
//   action: () => U
// }

export type Handler<T> = () => T

export interface MatchChain<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  on: (value: any, handler: Handler<T>) => MatchChain<T>
  otherwise: (handler: Handler<T>) => T
}
