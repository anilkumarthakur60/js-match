import { allOf, anyOf, match, not, UnhandledMatchError } from '@'
import type { NonExhaustive, Predicate, Unmatched } from '@'

/**
 * Suite for `.exhaustive()` and the guard combinators.
 *
 * As with `typing-and-terminal.test.ts`, much of the value is in the compile
 * step: this file is inside tsconfig's `include`, so the `@ts-expect-error`
 * directives below fail `tsc --noEmit` if the exhaustiveness check ever stops
 * rejecting an incomplete chain — a silent regression that no runtime assertion
 * could catch, since an incomplete chain still *runs* perfectly well.
 */

type Status = 'active' | 'archived' | 'draft'

describe('exhaustive() - compile-time coverage', () => {
  test('accepts a chain that covers every union member', () => {
    const label = (status: Status): string =>
      match<Status, string>(status)
        .on('active', () => 'Live')
        .on('archived', () => 'Archived')
        .on('draft', () => 'Draft')
        .exhaustive()

    expect(label('active')).toBe('Live')
    expect(label('archived')).toBe('Archived')
    expect(label('draft')).toBe('Draft')
  })

  test('rejects a chain with a member still uncovered', () => {
    const label = (status: Status): string =>
      match<Status, string>(status)
        .on('active', () => 'Live')
        .on('archived', () => 'Archived')
        // @ts-expect-error 'draft' has no arm, so exhaustive() demands an argument
        .exhaustive()

    // The call still works at runtime for the covered members — the missing arm
    // is a type error, not a behaviour change.
    expect(label('active')).toBe('Live')
  })

  test('rejects a chain with no arms at all', () => {
    expect(() =>
      match<Status, string>('active')
        // @ts-expect-error nothing is covered
        .exhaustive()
    ).toThrow(UnhandledMatchError)
  })

  test('onAny covers every value it lists', () => {
    const kind = (status: Status): string =>
      match<Status, string>(status)
        .onAny(['active', 'draft'], () => 'editable')
        .on('archived', () => 'frozen')
        .exhaustive()

    expect(kind('active')).toBe('editable')
    expect(kind('draft')).toBe('editable')
    expect(kind('archived')).toBe('frozen')
  })

  test('onAny leaves anything it does not list', () => {
    const kind = (status: Status): string =>
      match<Status, string>(status)
        .onAny(['active', 'draft'], () => 'editable')
        // @ts-expect-error 'archived' is still uncovered
        .exhaustive()

    expect(kind('active')).toBe('editable')
  })

  test('numeric and boolean unions narrow the same way', () => {
    const parity = (n: 1 | 2): string =>
      match<1 | 2, string>(n)
        .on(1, () => 'one')
        .on(2, () => 'two')
        .exhaustive()
    expect(parity(2)).toBe('two')

    const flag = (b: boolean): string =>
      match<boolean, string>(b)
        .on(true, () => 'yes')
        .on(false, () => 'no')
        .exhaustive()
    expect(flag(true)).toBe('yes')
  })

  test('a predicate arm proves nothing, so the remainder survives', () => {
    // Deliberate: a guard's outcome is not statically knowable, so covering
    // 'archived' | 'draft' by predicate must NOT unlock exhaustive().
    const isNotActive: Predicate<Status> = (s) => s !== 'active'

    const label = (status: Status): string =>
      match<Status, string>(status)
        .on('active', () => 'Live')
        .on(isNotActive, () => 'Other')
        // @ts-expect-error a predicate leaves 'archived' | 'draft' outstanding
        .exhaustive()

    expect(label('draft')).toBe('Other')
  })

  test('an open-ended subject type is never exhaustible', () => {
    // Exclude cannot empty `string`, and no finite set of arms covers it, so the
    // chain correctly stays unresolvable by exhaustive().
    const label = (value: string): string =>
      match<string, string>(value)
        .on('a', () => 'A')
        // @ts-expect-error `string` has infinitely many remaining values
        .exhaustive()

    expect(label('a')).toBe('A')
  })

  test('throws when the declared type was lied to at runtime', () => {
    // The compiler believes this chain is total; the value is not really a
    // Status. exhaustive() still throws rather than returning undefined.
    const smuggled = 'deleted' as Status

    expect(() =>
      match<Status, string>(smuggled)
        .on('active', () => 'Live')
        .on('archived', () => 'Archived')
        .on('draft', () => 'Draft')
        .exhaustive()
    ).toThrow(UnhandledMatchError)
  })

  test('exhaustive() is idempotent, like get()', () => {
    const matcher = match<'a', string>('a').on('a', () => 'hit')
    expect(matcher.exhaustive()).toBe('hit')
    expect(matcher.exhaustive()).toBe('hit')
  })

  test('an inferring chain carries its result type through exhaustive()', () => {
    // No pinned TResult here: the `number` annotation is what fails to compile
    // if exhaustive() ever stops propagating the inferred union.
    //
    // The subject is a function parameter on purpose. An annotated `const` would
    // be narrowed to its assigned literal by control-flow analysis, so TSubject
    // would infer as 'active' rather than Status and the other two arms would be
    // rejected outright — a TypeScript-wide behaviour, not a matcher one.
    const rank = (status: Status): number =>
      match(status)
        .on('active', () => 1)
        .on('archived', () => 2)
        .on('draft', () => 3)
        .exhaustive()

    expect(rank('active')).toBe(1)
    expect(rank('draft')).toBe(3)
  })

  test('duplicate arms are allowed and do not un-narrow', () => {
    // The first matching arm wins at runtime; a repeat arm is redundant rather
    // than an error, and must not resurrect the case in TRemaining.
    const label = match<'a' | 'b', string>('a')
      .on('a', () => 'first')
      .on('a', () => 'second')
      .on('b', () => 'b')
      .exhaustive()
    expect(label).toBe('first')
  })
})

describe('exhaustive() - type helpers', () => {
  test('Unmatched removes literal patterns and keeps predicate ones', () => {
    // Assignability in both directions pins these to exactly the stated type.
    const afterLiteral: Unmatched<'a' | 'b', 'a' | 'b', 'a'> = 'b'
    expect(afterLiteral).toBe('b')

    const afterPredicate: Unmatched<'a' | 'b', 'a' | 'b', Predicate<'a' | 'b'>> = 'a'
    expect(afterPredicate).toBe('a')

    // @ts-expect-error 'a' was removed by the literal arm
    const removed: Unmatched<'a' | 'b', 'a' | 'b', 'a'> = 'a'
    expect(removed).toBe('a')
  })

  test('a function subject narrows by identity rather than being read as a guard', () => {
    const fn = (): string => 'hello'
    type Fn = typeof fn

    // Pattern<Fn> withdraws the predicate arm, so the pattern is an identity
    // comparison and therefore does narrow.
    const exhausted: Unmatched<Fn, Fn, Fn> = undefined as never
    expect(exhausted).toBeUndefined()

    const result = match<Fn, string>(fn)
      .on(fn, () => 'identity')
      .exhaustive()
    expect(result).toBe('identity')
  })

  test('NonExhaustive cannot be satisfied', () => {
    // The escape hatch costs an explicit `as never`, which is the point: it is
    // visible in review rather than silently accepted.
    const forced = match<Status, string>('active')
      .on('active', () => 'Live')
      .exhaustive(undefined as never)
    expect(forced).toBe('Live')

    // @ts-expect-error `nonExhaustive: never` makes the object impossible
    const impossible: NonExhaustive<'draft'> = { missingCases: 'draft', nonExhaustive: undefined }
    expect(impossible.missingCases).toBe('draft')
  })
})

describe('guard combinators', () => {
  const isPositive: Predicate<number> = (n) => n > 0
  const isEven: Predicate<number> = (n) => n % 2 === 0

  test('not - inverts a predicate', () => {
    expect(not(isEven)(3)).toBe(true)
    expect(not(isEven)(4)).toBe(false)
  })

  test('not - composes inside a match chain', () => {
    const result = match(3)
      .on(not(isEven), () => 'odd')
      .otherwise(() => 'even')
    expect(result).toBe('odd')
  })

  test('not - double negation returns to the original', () => {
    expect(not(not(isEven))(4)).toBe(true)
  })

  test('allOf - requires every predicate', () => {
    expect(allOf(isPositive, isEven)(4)).toBe(true)
    expect(allOf(isPositive, isEven)(3)).toBe(false)
    expect(allOf(isPositive, isEven)(-4)).toBe(false)
  })

  test('allOf - matches everything when given nothing', () => {
    expect(allOf<number>()(0)).toBe(true)
  })

  test('allOf - short-circuits on the first failure', () => {
    const calls: string[] = []
    const fails: Predicate<number> = () => {
      calls.push('first')
      return false
    }
    const never: Predicate<number> = () => {
      calls.push('second')
      return true
    }
    expect(allOf(fails, never)(1)).toBe(false)
    expect(calls).toEqual(['first'])
  })

  test('anyOf - requires at least one predicate', () => {
    expect(anyOf(isPositive, isEven)(-4)).toBe(true)
    expect(anyOf(isPositive, isEven)(3)).toBe(true)
    expect(anyOf(isPositive, isEven)(-3)).toBe(false)
  })

  test('anyOf - matches nothing when given nothing', () => {
    expect(anyOf<number>()(0)).toBe(false)
  })

  test('anyOf - short-circuits on the first success', () => {
    const calls: string[] = []
    const hits: Predicate<number> = () => {
      calls.push('first')
      return true
    }
    const never: Predicate<number> = () => {
      calls.push('second')
      return false
    }
    expect(anyOf(hits, never)(1)).toBe(true)
    expect(calls).toEqual(['first'])
  })

  test('combinators nest', () => {
    const isSmall: Predicate<number> = (n) => n < 10
    const guard = allOf(isPositive, anyOf(isEven, isSmall), not(isSmall))

    expect(guard(20)).toBe(true) // positive, even, not small
    expect(guard(21)).toBe(false) // odd and not small -> anyOf fails
    expect(guard(4)).toBe(false) // small -> not(isSmall) fails
  })

  test('a combinator still counts as a predicate for exhaustiveness', () => {
    const result = match<Status, string>('draft')
      .on(
        anyOf<Status>((s) => s === 'draft'),
        () => 'editable'
      )
      // @ts-expect-error a composed guard is still a guard: nothing is proven
      .exhaustive()
    expect(result).toBe('editable')
  })
})
