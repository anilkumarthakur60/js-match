import { match, UnhandledMatchError, Matcher } from '../src/Matcher'

describe('Complete Coverage Tests', () => {
  describe('onAny method', () => {
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

  describe('default method', () => {
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

  describe('valueOf method', () => {
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
  })

  describe('Matcher class directly', () => {
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

  describe('Integration - All methods together', () => {
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

    test('Performance test with many handlers', () => {
      let matcher = match('target')
      for (let i = 0; i < 50; i++) {
        matcher = matcher.on(`case-${i}`, () => `result-${i}`)
      }
      matcher = matcher.on('target', () => 'found target')
      const result = matcher.valueOf()
      expect(result).toBe('found target')
    })
  })
})
