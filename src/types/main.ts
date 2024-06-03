export type Match<T, U> = {
  predicate: (val: T) => boolean
  action: () => U
}
