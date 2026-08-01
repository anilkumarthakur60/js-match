import type { Predicate } from './types'

/**
 * Combinators for building one predicate out of several.
 *
 * `.on()` takes a single predicate per arm, so composing conditions otherwise
 * means hand-writing a wrapper lambda for each combination. These give the three
 * useful shapes a name, keeping the guard readable at the call site:
 *
 * ```typescript
 * match(user)
 *   .on(allOf(isVerified, not(isSuspended)), () => 'ok')
 *   .otherwise(() => 'blocked')
 * ```
 *
 * All three return a plain `Predicate<T>`, so they nest freely and work anywhere
 * a predicate is accepted. Evaluation is short-circuiting and left-to-right,
 * matching `&&`/`||`: put the cheap checks first.
 *
 * @packageDocumentation
 */

/**
 * Negate a predicate.
 *
 * @template T The type of the value being matched against
 * @param predicate The predicate to invert
 * @returns A predicate matching exactly when `predicate` does not
 *
 * @example
 * ```typescript
 * const isEmpty: Predicate<string> = (s) => s.length === 0
 *
 * match('hello')
 *   .on(not(isEmpty), () => 'has content')
 *   .otherwise(() => 'empty')
 * // 'has content'
 * ```
 */
export function not<T>(predicate: Predicate<T>): Predicate<T> {
  return (value) => !predicate(value)
}

/**
 * Require every predicate to hold.
 *
 * Short-circuits on the first failure. With no predicates it matches
 * everything — the vacuous-truth reading, consistent with `Array.every` — which
 * makes it safe to spread a possibly-empty list of conditions into it.
 *
 * @template T The type of the value being matched against
 * @param predicates The predicates that must all hold
 * @returns A predicate matching only when every argument matches
 *
 * @example
 * ```typescript
 * const isPositive: Predicate<number> = (n) => n > 0
 * const isEven: Predicate<number> = (n) => n % 2 === 0
 *
 * match(4)
 *   .on(allOf(isPositive, isEven), () => 'positive and even')
 *   .otherwise(() => 'something else')
 * // 'positive and even'
 * ```
 */
export function allOf<T>(...predicates: readonly Predicate<T>[]): Predicate<T> {
  return (value) => predicates.every((predicate) => predicate(value))
}

/**
 * Require at least one predicate to hold.
 *
 * Short-circuits on the first success. With no predicates it matches nothing —
 * consistent with `Array.some`, and the mirror of `allOf`'s empty case.
 *
 * Distinct from `onAny`, which compares the subject against a list of *values*;
 * this composes a list of *conditions*.
 *
 * @template T The type of the value being matched against
 * @param predicates The candidate predicates
 * @returns A predicate matching when any argument matches
 *
 * @example
 * ```typescript
 * const isAdmin: Predicate<User> = (u) => u.role === 'admin'
 * const isOwner: Predicate<User> = (u) => u.role === 'owner'
 *
 * match(user)
 *   .on(anyOf(isAdmin, isOwner), () => 'may edit')
 *   .otherwise(() => 'read only')
 * ```
 */
export function anyOf<T>(...predicates: readonly Predicate<T>[]): Predicate<T> {
  return (value) => predicates.some((predicate) => predicate(value))
}
