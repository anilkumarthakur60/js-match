import { match, Matcher } from '../src/matcher'
import { UnhandledMatchError } from '../src/errors'

beforeEach(() => {
  jest.clearAllMocks()
})

describe('Match Expression - Comprehensive Test Suite', () => {
  // ============================================================================
  // BASIC FUNCTIONALITY TESTS
  // ============================================================================
  describe('Basic Functionality', () => {
    test('should return the correct action for the matched case', () => {
      const result = match('test')
        .on('test', () => 'matched')
        .on('not matched', () => 'not matched')
        .otherwise(() => 'otherwise')
      expect(result).toBe('matched')
    })

    test('should return the otherwise action if no cases are matched', () => {
      const result = match('test')
        .on('not matched', () => 'not matched')
        .otherwise(() => 'otherwise')
      expect(result).toBe('otherwise')
      expect(result).not.toBe('not matched')
    })

    test('should correctly handle multiple cases with one match', () => {
      const result = match('second')
        .on('first', () => 'first case')
        .on('second', () => 'second case')
        .on('third', () => 'third case')
        .otherwise(() => 'otherwise')
      expect(result).toBe('second case')
      expect(result).not.toBe('first case')
      expect(result).not.toBe('third case')
      expect(result).not.toBe('otherwise')
    })

    test('should execute the default action when provided', () => {
      const result = match('none')
        .on('first', () => 'first case')
        .on('second', () => 'second case')
        .otherwise(() => 'default action')
      expect(result).toBe('default action')
      expect(result).not.toBe('first case')
      expect(result).not.toBe('second case')
    })

    test('should correctly handle no cases with only otherwise', () => {
      const result = match('none').otherwise(() => 'default action')
      expect(result).toBe('default action')
      expect(result).not.toBe('first case')
    })

    test('executes the matching handler when subject matches an on condition', () => {
      const result = match('success')
        .on('success', () => 'success-handler')
        .on('error', () => 'error-handler')
        .otherwise(() => 'otherwise-handler')

      expect(result).toBe('success-handler')
    })

    test('executes otherwise handler if no conditions match', () => {
      const result = match('not-found')
        .on('success', () => 'success-handler')
        .on('error', () => 'error-handler')
        .otherwise(() => 'otherwise-handler')

      expect(result).toBe('otherwise-handler')
    })

    test('executes otherwise if no handler is defined at all', () => {
      const result = match('anything').otherwise(() => 'no-cases')
      expect(result).toBe('no-cases')
    })
  })

  // ============================================================================
  // TYPE MATCHING TESTS
  // ============================================================================
  describe('Type Matching', () => {
    describe('String Matching', () => {
      test('matches string literal', () => {
        expect(
          match('hello')
            .on('hello', () => 'matched')
            .otherwise(() => 'default')
        ).toBe('matched')

        expect(
          match('world')
            .on('hello', () => 'matched')
            .on('world', () => 'world')
            .otherwise(() => 'default')
        ).toBe('world')
      })

      test('string does not match different string', () => {
        expect(
          match('hello')
            .on('world', () => 'world')
            .on('hellos', () => 'hellos')
            .otherwise(() => 'default')
        ).toBe('default')
      })

      test('empty string matches', () => {
        expect(
          match('')
            .on('', () => 'empty')
            .otherwise(() => 'default')
        ).toBe('empty')
      })
    })

    describe('Number Matching', () => {
      test('matches integer', () => {
        expect(
          match(42)
            .on(42, () => 'forty-two')
            .otherwise(() => 'default')
        ).toBe('forty-two')
      })

      test('matches zero', () => {
        expect(
          match(0)
            .on(0, () => 'zero')
            .otherwise(() => 'default')
        ).toBe('zero')
      })

      test('+0 does not match -0 (Object.is semantics)', () => {
        // Object.is(+0, -0) === false, so they don't match
        expect(
          match(+0)
            .on(-0, () => 'zero matched')
            .otherwise(() => 'default')
        ).toBe('default')
      })

      test('matches negative number', () => {
        expect(
          match(-1)
            .on(-1, () => 'negative one')
            .otherwise(() => 'default')
        ).toBe('negative one')
      })

      test('matches decimal number', () => {
        expect(
          match(3.14)
            .on(3.14, () => 'pi')
            .otherwise(() => 'default')
        ).toBe('pi')
      })

      test('does not match different number', () => {
        expect(
          match(10)
            .on(9, () => 'nine')
            .otherwise(() => 'default')
        ).toBe('default')
      })

      test('0 and -0 are distinct with Object.is', () => {
        // Object.is(0, -0) === false
        // To match both, use a predicate or match both explicitly
        expect(
          match(0)
            .on(-0, () => 'minus zero')
            .on(0, () => 'plus zero')
            .otherwise(() => 'default')
        ).toBe('plus zero')
      })

      test('matches Infinity', () => {
        expect(
          match(Infinity)
            .on(Infinity, () => 'infinity matched')
            .otherwise(() => 'default')
        ).toBe('infinity matched')
      })

      test('matches -Infinity', () => {
        expect(
          match(-Infinity)
            .on(-Infinity, () => 'minus infinity matched')
            .otherwise(() => 'default')
        ).toBe('minus infinity matched')
      })
    })

    describe('Boolean Matching', () => {
      test('should correctly handle default true parameter', () => {
        const result = match(true)
          .on(true, () => true)
          .otherwise(() => 'default action')
        expect(result).toBe(true)
        expect(result).not.toBe('default action')
      })

      test('should correctly handle default false parameter', () => {
        const result = match(true)
          .on(true, () => 'true case')
          .otherwise(() => 'default action')
        expect(result).toBe('true case')
        expect(result).not.toBe('default action')
      })

      test('should correctly handle default false case', () => {
        const result = match(false)
          .on(true, () => true)
          .otherwise(() => 'default action')
        expect(result).toBe('default action')
        expect(result).not.toBe(true)
      })

      test('should correctly handle default true case', () => {
        const result = match(false)
          .on(false, () => false)
          .otherwise(() => 'default action')
        expect(result).toBe(false)
        expect(result).not.toBe('default action')
      })

      test('matches true', () => {
        expect(
          match(true)
            .on(true, () => 'yes')
            .otherwise(() => 'no')
        ).toBe('yes')
      })

      test('matches false', () => {
        expect(
          match(false)
            .on(false, () => 'no')
            .otherwise(() => 'yes')
        ).toBe('no')
      })

      test('false does not match true', () => {
        expect(
          match(false)
            .on(true, () => 'yes')
            .otherwise(() => 'no')
        ).toBe('no')
      })
    })

    describe('Null and Undefined Matching', () => {
      test('should correctly handle default null case', () => {
        const result = match(null)
          .on(null, () => null)
          .otherwise(() => 'default action')
        expect(result).toBe(null)
        expect(result).not.toBe('default action')
      })

      test('should correctly handle default undefined case', () => {
        const result = match(undefined)
          .on(undefined, () => undefined)
          .otherwise(() => 'default action')
        expect(result).toBe(undefined)
        expect(result).not.toBe('default action')
      })

      test('matches null', () => {
        expect(
          match(null)
            .on(null, () => 'null matched')
            .otherwise(() => 'default')
        ).toBe('null matched')
      })

      test('matches undefined', () => {
        expect(
          match(undefined)
            .on(undefined, () => 'undefined matched')
            .otherwise(() => 'default')
        ).toBe('undefined matched')
      })

      test('subject null matches correctly with side effect', () => {
        const fn = jest.fn(() => 'matched')
        const result = match(null)
          .on(null, fn)
          .otherwise(() => 'default')
        expect(result).toBe('matched')
        expect(fn).toHaveBeenCalledTimes(1)
      })
    })

    describe('Symbol Matching', () => {
      test('matches same symbol', () => {
        const sym = Symbol('foo')
        expect(
          match(sym)
            .on(sym, () => 'symbol matched')
            .otherwise(() => 'default')
        ).toBe('symbol matched')
      })

      test('does not match different symbols', () => {
        expect(
          match(Symbol('foo'))
            .on(Symbol('foo'), () => 'symbol matched')
            .otherwise(() => 'default')
        ).toBe('default')
      })
    })

    describe('BigInt Matching', () => {
      test('matches BigInt', () => {
        expect(
          match(10n)
            .on(10n, () => 'bigint matched')
            .otherwise(() => 'default')
        ).toBe('bigint matched')
      })

      test('does not match different BigInt', () => {
        expect(
          match(10n)
            .on(20n, () => 'bigint matched')
            .otherwise(() => 'default')
        ).toBe('default')
      })
    })

    describe('Object and Array Reference Matching', () => {
      test('matches same object reference', () => {
        const obj = { a: 1 }
        expect(
          match(obj)
            .on(obj, () => 'matched object')
            .otherwise(() => 'default')
        ).toBe('matched object')
      })

      test('does not match identical object by value', () => {
        expect(
          match({ a: 1 })
            .on({ a: 1 }, () => 'matched object')
            .otherwise(() => 'default')
        ).toBe('default')
      })

      test('matches same array reference', () => {
        const arr = [1, 2]
        expect(
          match(arr)
            .on(arr, () => 'matched array')
            .otherwise(() => 'default')
        ).toBe('matched array')
      })

      test('does not match identical array by value', () => {
        expect(
          match([1, 2])
            .on([1, 2], () => 'matched array')
            .otherwise(() => 'default')
        ).toBe('default')
      })

      test('object with toString does not affect matching', () => {
        const obj = {
          toString() {
            return 'foo'
          }
        }
        expect(
          match(obj)
            .on(obj, () => 'matched')
            .otherwise(() => 'default')
        ).toBe('matched')
      })
    })

    describe('Function and Class Instance Matching', () => {
      test('matches same function reference', () => {
        const fn = () => {}
        expect(
          match(fn)
            .on(fn, () => 'matched fn')
            .otherwise(() => 'default')
        ).toBe('matched fn')
      })

      test('does not match different function with same implementation', () => {
        expect(
          match(() => {})
            .on(
              () => {},
              () => 'matched fn'
            )
            .otherwise(() => 'default')
        ).toBe('default')
      })

      test('class instance matching by reference', () => {
        class A {}
        const a = new A()
        expect(
          match(a)
            .on(a, () => 'matched instance')
            .otherwise(() => 'default')
        ).toBe('matched instance')
      })

      test('different class instance no match', () => {
        class A {}
        expect(
          match(new A())
            .on(new A(), () => 'matched instance')
            .otherwise(() => 'default')
        ).toBe('default')
      })
    })

    describe('Enum Matching', () => {
      enum Color {
        Red,
        Blue,
        Green
      }
      test('matches TypeScript enum', () => {
        expect(
          match(Color.Blue)
            .on(Color.Red, () => 'red')
            .on(Color.Blue, () => 'blue')
            .on(Color.Green, () => 'green')
            .otherwise(() => 'unknown')
        ).toBe('blue')
      })
    })
  })

  // ============================================================================
  // ON METHOD TESTS
  // ============================================================================
  describe('on() Method', () => {
    test('works with multiple conditions and ensures the first match is used', () => {
      const result = match('spinner')
        .on('success', () => 'success-handler')
        .on('error', () => 'error-handler')
        .on('warning', () => 'warning-handler')
        .on('info', () => 'info-handler')
        .on('defaultNotify', () => 'defaultNotify-handler')
        .on('dark', () => 'dark-handler')
        .on('light', () => 'light-handler')
        .on('spinner', () => 'spinner-handler')
        .otherwise(() => 'otherwise-handler')

      expect(result).toBe('spinner-handler')
    })

    test('executes the correct handler when multiple .on are provided and matches the later one', () => {
      const result = match('error')
        .on('info', () => 'info-handler')
        .on('success', () => 'success-handler')
        .on('error', () => 'error-handler')
        .on('warning', () => 'warning-handler')
        .otherwise(() => 'otherwise-handler')

      expect(result).toBe('error-handler')
    })

    test('chain .on returns this for chaining', () => {
      const matcher = match('a')
        .on('a', () => 'A')
        .on('b', () => 'B')
      expect(typeof matcher.otherwise).toBe('function')
    })

    test('many chained .on calls', () => {
      const result = match('x')
        .on('a', () => 'A')
        .on('b', () => 'B')
        .on('c', () => 'C')
        .on('x', () => 'X')
        .otherwise(() => 'default')
      expect(result).toBe('X')
    })

    test('first matching handler wins (eager execution)', () => {
      // With eager execution, the first match executes immediately
      // Subsequent .on() calls for the same key are ignored
      const result = match('key')
        .on('key', () => 'first')
        .on('key', () => 'second')
        .otherwise(() => 'default')
      expect(result).toBe('first')
    })

    test('same handler used for multiple keys', () => {
      const handler = jest.fn(() => 'handled')
      const result = match('bar')
        .on('foo', handler)
        .on('bar', handler)
        .otherwise(() => 'default')
      expect(result).toBe('handled')
      expect(handler).toHaveBeenCalledTimes(1)
    })

    test('eager execution - side effects run immediately without otherwise', () => {
      // This is the key behavior change: handlers execute immediately on match
      let sideEffect = 'initial'
      match('team-section')
        .on('hero-section', () => (sideEffect = 'hero'))
        .on('team-section', () => (sideEffect = 'team'))
      // Side effect should have run without calling otherwise() or valueOf()
      expect(sideEffect).toBe('team')
    })

    test('eager execution - only first match executes', () => {
      const calls: string[] = []
      match('a')
        .on('a', () => calls.push('first'))
        .on('a', () => calls.push('second'))
        .on('b', () => calls.push('b'))
      expect(calls).toEqual(['first'])
    })

    test('isMatched property reflects match state', () => {
      const matcher1 = match('found').on('found', () => 'yes')
      expect(matcher1.isMatched).toBe(true)

      const matcher2 = match('missing').on('other', () => 'no')
      expect(matcher2.isMatched).toBe(false)
    })
  })

  // ============================================================================
  // PREDICATE / GUARD MATCHING TESTS
  // ============================================================================
  describe('Predicate Matching', () => {
    test('predicate - matches when function returns true', () => {
      const result = match(10)
        .on((v) => v > 5, () => 'GT5')
        .otherwise(() => 'DEFAULT')
      expect(result).toBe('GT5')
    })

    test('predicate - skips when function returns false', () => {
      const result = match(3)
        .on((v) => v > 5, () => 'GT5')
        .otherwise(() => 'DEFAULT')
      expect(result).toBe('DEFAULT')
    })

    test('predicate - first matching predicate wins', () => {
      const result = match(10)
        .on((v) => v > 5, () => 'GT5')
        .on((v) => v > 8, () => 'GT8')
        .otherwise(() => 'DEFAULT')
      expect(result).toBe('GT5')
    })

    test('predicate - range matching', () => {
      const grade = (score: number) =>
        match(score)
          .on((n) => n >= 90, () => 'A')
          .on((n) => n >= 80, () => 'B')
          .on((n) => n >= 70, () => 'C')
          .on((n) => n >= 60, () => 'D')
          .otherwise(() => 'F')

      expect(grade(95)).toBe('A')
      expect(grade(85)).toBe('B')
      expect(grade(75)).toBe('C')
      expect(grade(65)).toBe('D')
      expect(grade(55)).toBe('F')
    })

    test('predicate - type checking', () => {
      const checkType = (val: unknown) =>
        match(val)
          .on((v: unknown) => typeof v === 'string', () => 'string')
          .on((v: unknown) => typeof v === 'number', () => 'number')
          .on((v: unknown) => Array.isArray(v), () => 'array')
          .otherwise(() => 'other')

      expect(checkType('hello')).toBe('string')
      expect(checkType(42)).toBe('number')
      expect(checkType([1, 2, 3])).toBe('array')
      expect(checkType({})).toBe('other')
    })

    test('predicate - mixed with literal matching', () => {
      const result = match(5)
        .on(5, () => 'exact')
        .on((v) => v > 0, () => 'positive')
        .otherwise(() => 'default')
      expect(result).toBe('exact')
    })

    test('predicate - literal after predicate', () => {
      const result = match(10)
        .on((v) => v < 0, () => 'negative')
        .on(10, () => 'ten')
        .otherwise(() => 'default')
      expect(result).toBe('ten')
    })

    test('predicate - with side effects', () => {
      let sideEffect = ''
      match('admin')
        .on((v) => v === 'admin', () => (sideEffect = 'is admin'))
        .on((v) => v === 'user', () => (sideEffect = 'is user'))

      expect(sideEffect).toBe('is admin')
    })

    test('predicate - object shape checking', () => {
      interface User {
        role: string
        active: boolean
      }
      const user: User = { role: 'admin', active: true }

      const result = match(user)
        .on((u) => u.role === 'admin' && u.active, () => 'active admin')
        .on((u) => u.role === 'admin', () => 'inactive admin')
        .otherwise(() => 'not admin')

      expect(result).toBe('active admin')
    })
  })

  // ============================================================================
  // OBJECT.IS MATCHING TESTS
  // ============================================================================
  describe('Object.is Matching', () => {
    test('Object.is - NaN matches NaN', () => {
      const result = match(NaN)
        .on(NaN, () => 'matched NaN')
        .otherwise(() => 'no match')
      expect(result).toBe('matched NaN')
    })

    test('Object.is - +0 and -0 are different', () => {
      const matchPositiveZero = match(+0)
        .on(-0, () => 'negative zero')
        .on(+0, () => 'positive zero')
        .otherwise(() => 'default')
      // Note: Object.is(+0, -0) is false, but +0 matches +0
      expect(matchPositiveZero).toBe('positive zero')
    })

    test('onAny - uses Object.is for NaN', () => {
      const result = match(NaN)
        .onAny([1, NaN, 3], () => 'found')
        .otherwise(() => 'not found')
      expect(result).toBe('found')
    })
  })

  // ============================================================================
  // RUN() METHOD TESTS
  // ============================================================================
  describe('run() Method', () => {
    test('run - returns true when matched', () => {
      const didMatch = match('a')
        .on('a', () => 'matched')
        .run()
      expect(didMatch).toBe(true)
    })

    test('run - returns false when not matched', () => {
      const didMatch = match('x')
        .on('a', () => 'matched')
        .run()
      expect(didMatch).toBe(false)
    })

    test('run - side effects execute before run()', () => {
      let executed = false
      const didMatch = match('trigger')
        .on('trigger', () => {
          executed = true
        })
        .run()
      expect(executed).toBe(true)
      expect(didMatch).toBe(true)
    })

    test('run - no side effects when no match', () => {
      let executed = false
      const didMatch = match('other')
        .on('trigger', () => {
          executed = true
        })
        .run()
      expect(executed).toBe(false)
      expect(didMatch).toBe(false)
    })

    test('run - with predicate matching', () => {
      const didMatch = match(10)
        .on((v) => v > 5, () => 'big')
        .run()
      expect(didMatch).toBe(true)
    })
  })

  // ============================================================================
  // ONANY METHOD TESTS
  // ============================================================================
  describe('onAny() Method', () => {
    test('onAny - matches multiple values to same handler', () => {
      const result = match('a')
        .onAny(['a', 'b', 'c'], () => 'matched')
        .otherwise(() => 'default')
      expect(result).toBe('matched')
    })

    test('onAny - matches second value in array', () => {
      const result = match('b')
        .onAny(['a', 'b', 'c'], () => 'matched')
        .otherwise(() => 'default')
      expect(result).toBe('matched')
    })

    test('onAny - matches last value in array', () => {
      const result = match('c')
        .onAny(['a', 'b', 'c'], () => 'matched')
        .otherwise(() => 'default')
      expect(result).toBe('matched')
    })

    test('onAny - does not match value outside array', () => {
      const result = match('d')
        .onAny(['a', 'b', 'c'], () => 'matched')
        .otherwise(() => 'default')
      expect(result).toBe('default')
    })

    test('onAny - works with numbers', () => {
      const result = match(2)
        .onAny([1, 2, 3], () => 'matched')
        .otherwise(() => 'default')
      expect(result).toBe('matched')
    })

    test('onAny - empty array does not match', () => {
      const result = match('a')
        .onAny([], () => 'matched')
        .otherwise(() => 'default')
      expect(result).toBe('default')
    })

    test('onAny - chaining with multiple onAny calls', () => {
      const result = match('x')
        .onAny(['a', 'b'], () => 'first')
        .onAny(['x', 'y'], () => 'second')
        .otherwise(() => 'default')
      expect(result).toBe('second')
    })

    test('onAny - readonly array support', () => {
      const values: readonly string[] = ['foo', 'bar']
      const result = match('foo')
        .onAny(values, () => 'matched')
        .otherwise(() => 'default')
      expect(result).toBe('matched')
    })

    test('onAny - mixed with on() method', () => {
      const result = match('b')
        .on('a', () => 'single')
        .onAny(['b', 'c'], () => 'multiple')
        .otherwise(() => 'default')
      expect(result).toBe('multiple')
    })

    test('onAny - handler with side effects', () => {
      const fn = jest.fn(() => 'matched')
      const result = match('b')
        .onAny(['a', 'b', 'c'], fn)
        .otherwise(() => 'default')
      expect(result).toBe('matched')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    test('onAny - returns this for chaining', () => {
      const matcher = match('a')
        .onAny(['a', 'b'], () => 'test')
      expect(typeof matcher.on).toBe('function')
      expect(typeof matcher.otherwise).toBe('function')
    })
  })

  // ============================================================================
  // OTHERWISE METHOD TESTS
  // ============================================================================
  describe('otherwise() Method', () => {
    test('default handler called', () => {
      const defFn = jest.fn(() => 'default')
      const result = match('nope')
        .on('something', () => 'something')
        .otherwise(defFn)
      expect(result).toBe('default')
      expect(defFn).toHaveBeenCalledTimes(1)
    })

    test('multiple otherwise calls use last handler', () => {
      const matcher = match('foo').on('bar', () => 'bar')
      expect(matcher.otherwise(() => 'first')).toBe('first')
      expect(matcher.otherwise(() => 'second')).toBe('second')
    })

    test('check that console logs or side effects can happen inside handlers', () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

      const result = match('warning')
        .on('success', () => {
          console.log('success log')
          return 'success-handler'
        })
        .on('warning', () => {
          console.log('warning log')
          return 'warning-handler'
        })
        .otherwise(() => {
          console.log('otherwise log')
          return 'otherwise-handler'
        })

      expect(result).toBe('warning-handler')
      expect(consoleSpy).toHaveBeenCalledWith('warning log')
      expect(consoleSpy).not.toHaveBeenCalledWith('success log')
      expect(consoleSpy).not.toHaveBeenCalledWith('otherwise log')

      consoleSpy.mockRestore()
    })
  })

  // ============================================================================
  // DEFAULT METHOD TESTS
  // ============================================================================
  describe('default() Method - PHP Compatibility', () => {
    test('default - executes handler and returns result', () => {
      const result = match('foo')
        .on('bar', () => 'bar')
        .default(() => 'default result')
      expect(result).toBe('default result')
    })

    test('default - matches case if found', () => {
      const result = match('foo')
        .on('foo', () => 'matched')
        .default(() => 'default')
      expect(result).toBe('matched')
    })

    test('default - works with multiple cases', () => {
      const result = match('c')
        .on('a', () => 'a')
        .on('b', () => 'b')
        .default(() => 'default')
      expect(result).toBe('default')
    })

    test('default - returns various types', () => {
      expect(
        match('x')
          .on('y', () => 'str')
          .default(() => 'default')
      ).toBe('default')

      expect(
        match('x')
          .on('y', () => 123)
          .default(() => 456)
      ).toBe(456)

      expect(
        match('x')
          .on('y', () => true)
          .default(() => false)
      ).toBe(false)
    })

    test('default - is equivalent to otherwise', () => {
      const matcher1 = match('test')
        .on('other', () => 'other')

      const matcher2 = match('test')
        .on('other', () => 'other')

      const defaultResult = matcher1.default(() => 'default')
      const otherwiseResult = matcher2.otherwise(() => 'default')

      expect(defaultResult).toBe(otherwiseResult)
    })

    test('default - executes handler with side effects', () => {
      const fn = jest.fn(() => 'result')
      const result = match('no-match')
        .on('something', () => 'something')
        .default(fn)
      expect(result).toBe('result')
      expect(fn).toHaveBeenCalledTimes(1)
    })

    test('default - can override previous default', () => {
      const matcher = match('x').on('y', () => 'y')
      expect(matcher.default(() => 'first')).toBe('first')
      expect(matcher.default(() => 'second')).toBe('second')
    })

    test('default - throws when no match and handler throws', () => {
      expect(() =>
        match('x')
          .on('y', () => 'y')
          .default(() => {
            throw new Error('Custom error')
          })
      ).toThrow('Custom error')
    })

    test('default - with null result', () => {
      const result = match('x')
        .on('y', () => 'y')
        .default(() => null)
      expect(result).toBeNull()
    })

    test('default - with undefined result', () => {
      const result = match('x')
        .on('y', () => 'y')
        .default(() => undefined)
      expect(result).toBeUndefined()
    })
  })

  // ============================================================================
  // VALUEOF METHOD TESTS
  // ============================================================================
  describe('valueOf() Method', () => {
    test('valueOf - returns matched handler result', () => {
      const result = match('foo')
        .on('foo', () => 'matched')
        .valueOf()
      expect(result).toBe('matched')
    })

    test('valueOf - throws UnhandledMatchError when no match', () => {
      expect(() => {
        match('foo')
          .on('bar', () => 'bar')
          .valueOf()
      }).toThrow(UnhandledMatchError)
    })

    test('valueOf - throws with correct error message', () => {
      expect(() => {
        match('test-value')
          .on('other', () => 'other')
          .valueOf()
      }).toThrow('Unhandled match value: "test-value"')
    })

    test('valueOf - with multiple cases, first match wins', () => {
      const result = match('b')
        .on('a', () => 'first')
        .on('b', () => 'second')
        .on('c', () => 'third')
        .valueOf()
      expect(result).toBe('second')
    })

    test('valueOf - returns various types', () => {
      expect(
        match('str')
          .on('str', () => 'string result')
          .valueOf()
      ).toBe('string result')

      expect(
        match('num')
          .on('num', () => 42)
          .valueOf()
      ).toBe(42)

      expect(
        match('bool')
          .on('bool', () => true)
          .valueOf()
      ).toBe(true)
    })

    test('valueOf - with object result', () => {
      const obj = { key: 'value' }
      const result = match('obj')
        .on('obj', () => obj)
        .valueOf()
      expect(result).toBe(obj)
    })

    test('valueOf - with array result', () => {
      const arr = [1, 2, 3]
      const result = match('arr')
        .on('arr', () => arr)
        .valueOf()
      expect(result).toBe(arr)
    })

    test('valueOf - with function result', () => {
      const fn = () => 'test'
      const result = match('fn')
        .on('fn', () => fn)
        .valueOf()
      expect(result).toBe(fn)
    })

    test('valueOf - with null result', () => {
      const result = match('null')
        .on('null', () => null)
        .valueOf()
      expect(result).toBeNull()
    })

    test('valueOf - with undefined result', () => {
      const result = match('undef')
        .on('undef', () => undefined)
        .valueOf()
      expect(result).toBeUndefined()
    })

    test('valueOf - called multiple times returns same result', () => {
      const matcher = match('a')
        .on('a', () => 'result')
      expect(matcher.valueOf()).toBe('result')
      expect(matcher.valueOf()).toBe('result')
    })

    test('valueOf - throws error from handler', () => {
      expect(() => {
        match('error')
          .on('error', () => {
            throw new Error('Handler error')
          })
          .valueOf()
      }).toThrow('Handler error')
    })

    test('valueOf - with complex nested matching', () => {
      const result = match('status')
        .on('loading', () => 'loading')
        .on('status', () => {
          return match('details')
            .on('details', () => 'detailed status')
            .valueOf()
        })
        .valueOf()
      expect(result).toBe('detailed status')
    })

    test('Match function test', () => {
      expect(() =>
        match(1)
          .on(1, () => 1)
          .otherwise(() => 'default action')
      ).not.toThrow()
      expect(() =>
        match(2)
          .on(1, () => 1)
          .otherwise(() => 'default action')
      ).not.toThrow()
    })
  })

  // ============================================================================
  // HANDLER BEHAVIOR TESTS
  // ============================================================================
  describe('Handler Behavior and Side Effects', () => {
    test('only calls matching handler', () => {
      const fn1 = jest.fn(() => 'foo')
      const fn2 = jest.fn(() => 'bar')
      const fnDefault = jest.fn(() => 'default')
      const result = match('bar').on('foo', fn1).on('bar', fn2).otherwise(fnDefault)
      expect(result).toBe('bar')
      expect(fn1).not.toHaveBeenCalled()
      expect(fn2).toHaveBeenCalledTimes(1)
      expect(fnDefault).not.toHaveBeenCalled()
    })

    test('handler modifies external variable', () => {
      let called = false
      const result = match('test')
        .on('test', () => {
          called = true
          return 'ok'
        })
        .otherwise(() => 'fail')
      expect(result).toBe('ok')
      expect(called).toBe(true)
    })

    test('handlers return various types', () => {
      expect(
        match('str')
          .on('str', () => 'string')
          .otherwise(() => 'default')
      ).toBe('string')
      expect(
        match('num')
          .on('num', () => 123)
          .otherwise(() => 0)
      ).toBe(123)
      expect(
        match('bool')
          .on('bool', () => true)
          .otherwise(() => false)
      ).toBe(true)
      const obj = { foo: 'bar' }
      expect(
        match('obj')
          .on('obj', () => obj)
          .otherwise(() => ({}))
      ).toBe(obj)
      expect(
        match('undef')
          .on('undef', () => undefined)
          .otherwise(() => 'default')
      ).toBeUndefined()
    })

    test('async handler returns Promise', async () => {
      const result = match('async')
        .on('async', async () => 'resolved')
        .otherwise(() => 'default')
      await expect(result).resolves.toBe('resolved')
    })

    test('handler throws exception', () => {
      expect(() =>
        match('test')
          .on('test', () => {
            throw new Error('Handler error')
          })
          .otherwise(() => 'default')
      ).toThrow('Handler error')
    })
  })

  // ============================================================================
  // ERROR HANDLING TESTS
  // ============================================================================
  describe('Error Handling', () => {
    test('throws UnhandledMatchError when no match and no default', () => {
      expect(() => {
        match('nope')
          .on('something', () => 'something')
          .otherwise(() => {
            throw new UnhandledMatchError('nope')
          })
      }).toThrow(UnhandledMatchError)
      expect(() => {
        match('nope')
          .on('something', () => 'something')
          .otherwise(() => {
            throw new UnhandledMatchError('nope')
          })
      }).toThrow('Unhandled match value: "nope"')
    })

    test('throws if non-function handler is provided', () => {
      expect(() => {
        match('test')
          .on('tests', () => 'not a function')
          .otherwise(() => {
            throw new UnhandledMatchError('nope')
          })
      }).toThrow()
    })
  })

  // ============================================================================
  // MATCHER CLASS TESTS
  // ============================================================================
  describe('Matcher Class', () => {
    test('Matcher constructor creates instance', () => {
      const matcher = new Matcher('test')
      expect(matcher).toBeInstanceOf(Matcher)
    })

    test('Matcher with various subject types', () => {
      expect(new Matcher('string')).toBeInstanceOf(Matcher)
      expect(new Matcher(123)).toBeInstanceOf(Matcher)
      expect(new Matcher(true)).toBeInstanceOf(Matcher)
      expect(new Matcher(null)).toBeInstanceOf(Matcher)
      expect(new Matcher(undefined)).toBeInstanceOf(Matcher)
      expect(new Matcher({})).toBeInstanceOf(Matcher)
      expect(new Matcher([])).toBeInstanceOf(Matcher)
    })

    test('Matcher.on returns this', () => {
      const matcher = new Matcher('test')
      const result = matcher.on('test', () => 'result')
      expect(result).toBe(matcher)
    })

    test('Matcher.onAny returns this', () => {
      const matcher = new Matcher('test')
      const result = matcher.onAny(['test'], () => 'result')
      expect(result).toBe(matcher)
    })
  })

  // ============================================================================
  // UNHANDLED MATCH ERROR TESTS
  // ============================================================================
  describe('UnhandledMatchError', () => {
    test('UnhandledMatchError is instance of Error', () => {
      const error = new UnhandledMatchError('test')
      expect(error).toBeInstanceOf(Error)
    })

    test('UnhandledMatchError has correct name', () => {
      const error = new UnhandledMatchError('test')
      expect(error.name).toBe('UnhandledMatchError')
    })

    test('UnhandledMatchError formats value correctly', () => {
      const error = new UnhandledMatchError('string-value')
      expect(error.message).toContain('string-value')
    })

    test('UnhandledMatchError with object value', () => {
      const obj = { key: 'value' }
      const error = new UnhandledMatchError(obj)
      expect(error.message).toContain('key')
    })

    test('UnhandledMatchError with null', () => {
      const error = new UnhandledMatchError(null)
      expect(error.message).toContain('null')
    })

    test('UnhandledMatchError with undefined', () => {
      const error = new UnhandledMatchError(undefined)
      expect(error.message).toContain('undefined')
    })
  })

  // ============================================================================
  // TYPE SAFETY TESTS
  // ============================================================================
  describe('Type Safety', () => {
    test('enforces consistent subject types', () => {
      const result = match<string, string>('test')
        .on('test', () => 'matched')
        .otherwise(() => 'default')
      expect(result).toBe('matched')
    })

    test('enforces consistent return types', () => {
      const result = match<string, number>('test')
        .on('test', () => 1)
        .otherwise(() => 2)
      expect(result).toBe(1)
    })

    test('type safety with union types', () => {
      type Subject = 'a' | 'b' | number
      const result = match<Subject, string>('a')
        .on('a', () => 'A')
        .on('b', () => 'B')
        .on(42, () => 'Number')
        .otherwise(() => 'default')
      expect(result).toBe('A')
    })

    test('typed handleCheck example', () => {
      type CheckResult = { ok: boolean; code: number; warn?: boolean }

      const handleCheck = (check: string): CheckResult => {
        return match<string, CheckResult>(check)
          .on('error', () => ({ ok: false, code: 500 }))
          .on('warn', () => ({ ok: true, code: 200, warn: true }))
          .on('ok', () => ({ ok: true, code: 200 }))
          .otherwise(() => ({ ok: false, code: 400 }))
      }

      const errorResult = handleCheck('error')
      expect(errorResult.ok).toBe(false)
      expect(errorResult.code).toBe(500)

      const warnResult = handleCheck('warn')
      expect(warnResult.ok).toBe(true)
      expect(warnResult.warn).toBe(true)

      const okResult = handleCheck('ok')
      expect(okResult.ok).toBe(true)
      expect(okResult.code).toBe(200)

      const unknownResult = handleCheck('unknown')
      expect(unknownResult.ok).toBe(false)
      expect(unknownResult.code).toBe(400)
    })

    test('type safety with object return type', () => {
      interface ApiResponse {
        status: string
        data?: unknown
        error?: string
      }

      const getResponse = (code: number): ApiResponse => {
        return match<number, ApiResponse>(code)
          .on(200, () => ({ status: 'success', data: {} }))
          .on(404, () => ({ status: 'error', error: 'Not found' }))
          .on(500, () => ({ status: 'error', error: 'Server error' }))
          .otherwise(() => ({ status: 'unknown' }))
      }

      expect(getResponse(200).status).toBe('success')
      expect(getResponse(404).error).toBe('Not found')
      expect(getResponse(999).status).toBe('unknown')
    })
  })

  // ============================================================================
  // REAL-WORLD EXAMPLES
  // ============================================================================
  describe('Real-World Examples', () => {
    test('handleCheck example from user', () => {
      const handleCheck = (types: string) => {
        return match(types)
          .on('success', () => {
            console.log('----------------success output--', 'success')
            return 'success'
          })
          .on('error', () => {
            console.log('----------------error output--', 'error')
            return 'error'
          })
          .on('warning', () => {
            console.log('----------------warning output--', 'warning')
            return 'warning'
          })
          .on('info', () => {
            console.log('----------------info output--', 'info')
            return 'info'
          })
          .on('defaultNotify', () => {
            console.log('----------------defaultNotify output--', 'defaultNotify')
            return 'defaultNotify'
          })
          .on('dark', () => {
            console.log('----------------dark output--', 'dark')
            return 'dark'
          })
          .on('light', () => {
            console.log('----------------light output--', 'light')
            return 'light'
          })
          .on('spinner', () => {
            console.log('----------------spinner output--', 'spinner')
            return 'spinner'
          })
          .otherwise(() => {
            console.log('----------------otherwise output:', 'otherwise')
            return 'otherwise'
          })
      }

      const result = handleCheck('success')
      expect(result).toBe('success')

      const result2 = handleCheck('unmatched')
      expect(result2).toBe('otherwise')
    })

    test('complexCheck example with various data types', () => {
      const complexCheck = (input: unknown) => {
        return match(input)
          .on('hello', () => 'Matched hello')
          .on(42, () => 'Matched number 42')
          .on(true, () => 'Matched true')
          .on(null, () => 'Matched null')
          .on(undefined, () => 'Matched undefined')
          .otherwise(() => 'No match found')
      }
      expect(complexCheck('hello')).toBe('Matched hello')
      expect(complexCheck(42)).toBe('Matched number 42')
      expect(complexCheck(true)).toBe('Matched true')
      expect(complexCheck(null)).toBe('Matched null')
      expect(complexCheck(undefined)).toBe('Matched undefined')
      expect(complexCheck('unmatched')).toBe('No match found')
    })

    test('FizzBuzz example using modulo matching', () => {
      // Note: This pattern uses match(0) to check if remainder is 0
      // Order matters - more specific checks must come last since Map overwrites
      const fizzbuzz = (num: number) =>
        match(num % 15 === 0 ? 'fizzbuzz' : num % 3 === 0 ? 'fizz' : num % 5 === 0 ? 'buzz' : 'num')
          .on('fizzbuzz', () => 'FizzBuzz')
          .on('fizz', () => 'Fizz')
          .on('buzz', () => 'Buzz')
          .otherwise(() => num.toString())
      expect(fizzbuzz(15)).toBe('FizzBuzz')
      expect(fizzbuzz(3)).toBe('Fizz')
      expect(fizzbuzz(5)).toBe('Buzz')
      expect(fizzbuzz(7)).toBe('7')
    })

    test('FizzBuzz with conditional match(true)', () => {
      // When using match(true), only one condition should be true at a time
      // Use early return pattern or most specific check first
      const fizzBuzz = (n: number): string => {
        // Check most specific first
        if (n % 15 === 0) {
          return match<boolean, string>(true)
            .on(true, () => 'FizzBuzz')
            .otherwise(() => '')
        }
        return match<boolean, string>(true)
          .on(n % 3 === 0, () => 'Fizz')
          .on(n % 5 === 0, () => 'Buzz')
          .otherwise(() => n.toString())
      }

      expect(fizzBuzz(15)).toBe('FizzBuzz')
      expect(fizzBuzz(9)).toBe('Fizz')
      expect(fizzBuzz(5)).toBe('Buzz')
      expect(fizzBuzz(7)).toBe('7')
    })

    test('FizzBuzz with simple if-else (for comparison)', () => {
      const fizzBuzz = (n: number): string => {
        if (n % 15 === 0) return 'FizzBuzz'
        if (n % 3 === 0) return 'Fizz'
        if (n % 5 === 0) return 'Buzz'
        return n.toString()
      }

      expect(fizzBuzz(15)).toBe('FizzBuzz')
      expect(fizzBuzz(9)).toBe('Fizz')
      expect(fizzBuzz(5)).toBe('Buzz')
      expect(fizzBuzz(7)).toBe('7')
    })

    test('days in month example', () => {
      const isLeap = (year: number) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0)
      const daysInMonth = (month: string, year: number) =>
        match(month.toLowerCase().slice(0, 3))
          .on('jan', () => 31)
          .on('feb', () => (isLeap(year) ? 29 : 28))
          .on('mar', () => 31)
          .on('apr', () => 30)
          .on('may', () => 31)
          .on('jun', () => 30)
          .on('jul', () => 31)
          .on('aug', () => 31)
          .on('sep', () => 30)
          .on('oct', () => 31)
          .on('nov', () => 30)
          .on('dec', () => 31)
          .otherwise(() => {
            throw new Error('Bogus month')
          })
      expect(daysInMonth('January', 2025)).toBe(31)
      expect(daysInMonth('February', 2024)).toBe(29)
      expect(daysInMonth('February', 2025)).toBe(28)
      expect(daysInMonth('April', 2025)).toBe(30)
      expect(() => daysInMonth('Invalid', 2025)).toThrow('Bogus month')
    })

    test('HTTP status code handler', () => {
      const handleResponse = (status: number) => {
        return match(status)
          .on(200, () => 'OK')
          .onAny([201, 202, 204], () => 'Created/Accepted')
          .on(400, () => 'Bad Request')
          .on(401, () => 'Unauthorized')
          .on(403, () => 'Forbidden')
          .on(404, () => 'Not Found')
          .on(500, () => 'Server Error')
          .default(() => 'Unknown Status')
      }

      expect(handleResponse(200)).toBe('OK')
      expect(handleResponse(201)).toBe('Created/Accepted')
      expect(handleResponse(404)).toBe('Not Found')
      expect(handleResponse(999)).toBe('Unknown Status')
    })

    test('Nested match expressions', () => {
      const getUserStatus = (userId: string, status: string) => {
        return match(userId)
          .on('admin', () => {
            return match(status)
              .on('active', () => 'admin is active')
              .on('inactive', () => 'admin is inactive')
              .default(() => 'admin status unknown')
          })
          .on('user', () => {
            return match(status)
              .on('active', () => 'user is active')
              .default(() => 'user is inactive')
          })
          .default(() => 'user not found')
      }

      expect(getUserStatus('admin', 'active')).toBe('admin is active')
      expect(getUserStatus('user', 'active')).toBe('user is active')
      expect(getUserStatus('guest', 'active')).toBe('user not found')
    })

    test('Non-identity check with true subject for range matching', () => {
      const age = 23
      expect(
        match(true)
          .on(age >= 65, () => 'senior')
          .on(age >= 25, () => 'adult')
          .on(age >= 18, () => 'young adult')
          .otherwise(() => 'kid')
      ).toBe('young adult')
    })

    test('Non-identity check with true subject for string content', () => {
      const text = 'Bienvenue chez nous'
      expect(
        match(true)
          .on(text.includes('Welcome') || text.includes('Hello'), () => 'en')
          .on(text.includes('Bienvenue') || text.includes('Bonjour'), () => 'fr')
          .otherwise(() => 'unknown')
      ).toBe('fr')
    })
  })

  // ============================================================================
  // PERFORMANCE TESTS
  // ============================================================================
  describe('Performance and Edge Cases', () => {
    test('handles large number of match arms', () => {
      let matcher = match('z')
      for (let i = 0; i < 100; i++) {
        matcher = matcher.on(`key${i}`, () => `matched ${i}`)
      }
      const result = matcher.otherwise(() => 'default')
      expect(result).toBe('default')
    })

    test('Complete workflow with all methods', () => {
      const matcher = match('b')
        .on('a', () => 'a')
        .onAny(['b', 'c'], () => 'bc')
        .on('d', () => 'd')

      expect(matcher.valueOf()).toBe('bc')
    })

    test('Complete workflow using default', () => {
      const result = match('unknown')
        .on('a', () => 'a')
        .onAny(['b', 'c'], () => 'bc')
        .default(() => 'unknown value')

      expect(result).toBe('unknown value')
    })

    test('Performance test with many handlers', () => {
      let matcher = match('target')
      for (let i = 0; i < 50; i++) {
        matcher = matcher.on(`case-${i}`, () => `result-${i}`)
      }
      matcher = matcher.on('target', () => 'found target')
      const result = matcher.valueOf()
      expect(result).toBe('found target')
    })

    test('Simulated PHP comma-separated conditions', () => {
      const handler = jest.fn(() => 'one or two')
      const result = match(2)
        .on(1, handler)
        .on(2, handler)
        .otherwise(() => 'default')
      expect(result).toBe('one or two')
      expect(handler).toHaveBeenCalledTimes(1)
    })
  })
})
