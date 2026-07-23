import { match, Matcher, UnhandledMatchError } from '@'
import type { MatchChain, Pattern, Predicate } from '@'

/*
 * `valueOf` is deprecated in favour of `get()`, but it stays supported, so the
 * tests that pin its behaviour have to keep calling it.
 */
/* eslint-disable @typescript-eslint/no-deprecated */

/**
 * Regression suite for the terminal accessor and the type-level contract.
 *
 * Most of the value here is in the *compile* step, not the assertions: this file
 * is inside tsconfig's `include`, so a signature regression fails `tsc --noEmit`
 * even when every runtime expectation still passes. The `expect` calls exist so
 * the cases are also exercised at runtime and counted by coverage.
 */
describe('get() terminal accessor', () => {
  test('get - returns the matched handler result', () => {
    const result = match('a')
      .on('a', () => 'matched')
      .get()
    expect(result).toBe('matched')
  })

  test('get - throws UnhandledMatchError when nothing matched', () => {
    expect(() =>
      match('zzz')
        .on('a', () => 'a')
        .get()
    ).toThrow(UnhandledMatchError)
  })

  test('get - is idempotent', () => {
    const matcher = match('a').on('a', () => 'result')
    expect(matcher.get()).toBe('result')
    expect(matcher.get()).toBe('result')
  })

  test('valueOf - delegates to get for both outcomes', () => {
    const matched = match('a').on('a', () => 'result')
    expect(matched.valueOf()).toBe(matched.get())

    const unmatched = match('zzz').on('a', () => 'a')
    expect(() => unmatched.valueOf()).toThrow(UnhandledMatchError)
  })

  test('valueOf - still drives implicit coercion, which is why get() exists', () => {
    // Documenting the hazard the deprecation warns about: the engine calls
    // valueOf() during ToPrimitive, so an unmatched chain throws from an
    // expression that never names the method.
    const unmatched = match('zzz').on('a', () => 1)
    expect(() => Number(unmatched)).toThrow(UnhandledMatchError)
  })
})

describe('result type inference', () => {
  test('a bare match() infers the handler return type, not unknown', () => {
    // Annotated deliberately: this line fails to compile if the result widens
    // back to `unknown`, which is the bug being pinned.
    const result: number = match('x')
      .on('x', () => 42)
      .otherwise(() => 0)
    expect(result).toBe(42)
  })

  test('disagreeing handlers accumulate into a union', () => {
    const result: string | number = match('x')
      .on('x', () => 'hit')
      .onAny(['y', 'z'], () => 404)
      .otherwise(() => 0)
    expect(result).toBe('hit')

    // ...and the union is genuinely a union: it is not assignable to one arm.
    // @ts-expect-error string | number is not assignable to string
    const narrowed: string = match('x')
      .on('x', () => 'hit')
      .otherwise(() => 0)
    expect(narrowed).toBe('hit')
  })

  test('get() carries the inferred type through', () => {
    const result: string = match(2)
      .on(
        (n) => n > 1,
        () => 'big'
      )
      .get()
    expect(result).toBe('big')
  })

  test('an explicit match<S, R>() still pins every handler', () => {
    const result = match<string, string>('x')
      .on('x', () => 'matched')
      .otherwise(() => 'default')
    expect(result).toBe('matched')

    match<string, string>('x')
      // @ts-expect-error a pinned chain rejects a handler returning number
      .on('x', () => 404)
      .otherwise(() => 'default')
  })

  test('a pinned chain keeps its result type exactly, without widening', () => {
    const result: string = match<string, string>('x')
      .on('x', () => 'matched')
      .default(() => 'default')
    expect(result).toBe('matched')
  })
})

describe('MatchChain describes Matcher', () => {
  test('Matcher satisfies the published contract, including predicates', () => {
    const chain: MatchChain<string, number> = match<string, number>('a')
      .on(
        (v) => v.length === 1,
        () => 1
      )
      .onAny(['b', 'c'], () => 2)

    expect(chain.isMatched).toBe(true)
    expect(chain.run()).toBe(true)

    // valueOf/get are declared on the interface now, so they resolve to TResult
    // instead of silently degrading to Object.prototype.valueOf(): Object.
    const viaGet: number = chain.get()
    const viaValueOf: number = chain.valueOf()
    expect(viaGet).toBe(1)
    expect(viaValueOf).toBe(1)
    expect(chain.default(() => 0)).toBe(1)
  })

  test('a Matcher is assignable to MatchChain in the inferring form too', () => {
    // An inferring chain annotates with the type its handlers produced; the
    // pinned/inferring flag is derived and does not have to be spelled out.
    const chain: MatchChain<string, string> = match('a').on('a', () => 'hit')
    expect(chain.otherwise(() => 'miss')).toBe('hit')
  })

  test('Matcher and MatchChain agree on the terminal result type', () => {
    const matcher: Matcher<string, number> = new Matcher<string, number>('a')
    const chain: MatchChain<string, number> = matcher
    expect(chain.otherwise(() => 7)).toBe(7)
  })
})

describe('function-valued subjects mirror the runtime rule', () => {
  const fn = (): string => 'hello'

  test('a function subject matches by identity', () => {
    const result = match(fn)
      .on(fn, () => 'identity')
      .otherwise(() => 'miss')
    expect(result).toBe('identity')
  })

  test('a predicate against a function subject is now a compile error', () => {
    // At runtime the predicate would never be invoked (matcher.ts falls back to
    // Object.is for function subjects) and the case would silently fall
    // through, so the type withdraws the predicate arm here.
    const result = match(fn)
      .on(
        // The directive must sit on the line the error is reported on — the
        // argument, not the `.on(` call — or it is flagged unused (TS2578).
        // @ts-expect-error predicates are not accepted when the subject is a function
        (f: () => string) => f().length > 0,
        () => 'predicate ran'
      )
      .otherwise(() => 'fell through')
    // Pinning the runtime behaviour the type now forbids.
    expect(result).toBe('fell through')
  })

  test('predicates remain available for non-function subjects', () => {
    const isLong: Predicate<string> = (v) => v.length > 3
    const result = match('hello')
      .on(isLong, () => 'long')
      .otherwise(() => 'short')
    expect(result).toBe('long')

    // Pattern<T> keeps both arms for a non-function subject...
    const pattern: Pattern<string> = isLong
    expect(typeof pattern).toBe('function')
  })

  test('a union subject keeps both arms, since the rule is value-dependent', () => {
    type Subject = string | (() => void)
    const pattern: Pattern<Subject> = (v) => typeof v === 'string'
    const result = match<Subject, string>('a')
      .on(pattern, () => 'string-ish')
      .otherwise(() => 'other')
    expect(result).toBe('string-ish')
  })
})
