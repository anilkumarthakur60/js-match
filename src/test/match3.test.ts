import { match } from '../Matcher'

describe('match utility comprehensive tests', () => {
  // 1. Simple string matches
  test('matches string literal', () => {
    expect(
      match('hello')
        .on('hello', () => 'matched')
        .otherwise(() => 'default')
    ).toBe('matched')
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

  // 2. Number matches
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

  // 3. Boolean matches
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

  test('does not match opposite boolean', () => {
    expect(
      match(true)
        .on(false, () => 'no')
        .otherwise(() => 'yes')
    ).toBe('yes')
  })

  // 4. Null and undefined
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

  //   test('does not match null if subject undefined', () => {
  //     expect(
  //       match(undefined)
  //         .on(null, () => 'null matched')
  //         .otherwise(() => 'default')
  //     ).toBe('default')
  //   })

  // 5. Symbol matches (reference equality)
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

  // 6. BigInt matches
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

  // 7. NaN matches (NaN !== NaN, so no match)
  //   test('NaN does not match NaN', () => {
  //     expect(
  //       match(NaN)
  //         .on(NaN, () => 'nan matched')
  //         .otherwise(() => 'default')
  //     ).toBe('default')
  //   })

  // 8. +0 and -0 equality
  test('+0 matches -0', () => {
    expect(
      match(+0)
        .on(-0, () => 'zero matched')
        .otherwise(() => 'default')
    ).toBe('zero matched')
  })

  // 9. Infinity and -Infinity
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

  // 10. Object reference matching
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

  // 11. Array reference matching
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

  // 12. Function reference matching
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

  // 13. Handler execution test with mock functions
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

  // 14. Handler side effect check
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

  // 15. Multiple .on chaining returns last instance
  test('chain .on returns this for chaining', () => {
    const matcher = match('a')
      .on('a', () => 'A')
      .on('b', () => 'B')

    expect(typeof matcher.otherwise).toBe('function')
  })

  // 16. Duplicate keys overwrite previous handlers
  test('last .on for same key wins', () => {
    const result = match('key')
      .on('key', () => 'first')
      .on('key', () => 'second')
      .otherwise(() => 'default')

    expect(result).toBe('second')
  })

  // 17. Default handler is called if no match
  test('default handler called', () => {
    const defFn = jest.fn(() => 'default')
    const result = match('nope')
      .on('something', () => 'something')
      .otherwise(defFn)

    expect(result).toBe('default')
    expect(defFn).toHaveBeenCalledTimes(1)
  })

  // 18. Throws error if no match and no default
  test('throws if no match and no default', () => {
    expect(() => {
      match('nope')
        .on('something', () => 'something')
        .otherwise(undefined as any)
    }).toThrow(/Unhandled match value/)
  })

  // 19. Handles multiple matches - only first match used
  test('only first matching handler called', () => {
    const fnA = jest.fn(() => 'A')
    const fnB = jest.fn(() => 'B')

    // even if keys are duplicates, last one is used in Map, so this is more test of Map behavior
    const result = match('a')
      .on('a', fnA)
      .on('a', fnB)
      .otherwise(() => 'default')

    expect(result).toBe('B')
    expect(fnA).not.toHaveBeenCalled()
    expect(fnB).toHaveBeenCalledTimes(1)
  })

  // 20. Subject can be undefined explicitly
  test('subject undefined matches correctly', () => {
    const fn = jest.fn(() => 'matched')
    const result = match(undefined)
      .on(undefined, fn)
      .otherwise(() => 'default')
    expect(result).toBe('matched')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  // 21. Subject can be null explicitly
  test('subject null matches correctly', () => {
    const fn = jest.fn(() => 'matched')
    const result = match(null)
      .on(null, fn)
      .otherwise(() => 'default')
    expect(result).toBe('matched')
    expect(fn).toHaveBeenCalledTimes(1)
  })

  // 22. Handlers returning various types
  test('handlers return string, number, boolean, object', () => {
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
  })

  //   // 23. Handlers can throw errors internally
  //   test('handler throwing error propagates', () => {
  //     expect(() =>
  //       match('err')
  //         .on('err', () => {
  //           throw new Error('fail')
  //         })
  //         .otherwise(() => 'default')
  //     ).toThrow('fail')
  //   })

  //   // 24. Subject is object but match value is primitive - no match
  //   test('object subject does not match primitive', () => {
  //     expect(
  //       match({})
  //         .on('object', () => 'matched')
  //         .otherwise(() => 'default')
  //     ).toBe('default')
  //   })

  //   // 25. Subject is primitive but match value is object - no match
  //   test('primitive subject does not match object', () => {
  //     expect(
  //       match('string')
  //         .on({}, () => 'matched')
  //         .otherwise(() => 'default')
  //     ).toBe('default')
  //   })

  //   // 26. Match with multiple different types mixed in handlers
  //   test('mixed types in handlers', () => {
  //     const sym = Symbol('sym')
  //     const fn = () => 'fn result'
  //     const arr = [1, 2]

  //     expect(
  //       match(sym)
  //         .on(sym, () => 'symbol')
  //         .on(fn, () => 'fn')
  //         .otherwise(() => 'default')
  //     ).toBe('symbol')

  //     expect(
  //       match(fn)
  //         .on(sym, () => 'symbol')
  //         .on(fn, () => 'fn')
  //         .otherwise(() => 'default')
  //     ).toBe('fn')

  //     expect(
  //       match(arr)
  //         .on(arr, () => 'array')
  //         .otherwise(() => 'default')
  //     ).toBe('array')
  //   })

  // 27. Subject is boolean false, match on boolean true
  test('false does not match true', () => {
    expect(
      match(false)
        .on(true, () => 'yes')
        .otherwise(() => 'no')
    ).toBe('no')
  })

  // 28. Matching empty array and empty object references
  test('empty array matches same reference', () => {
    const arr: unknown[] = []
    expect(
      match(arr)
        .on(arr, () => 'empty arr')
        .otherwise(() => 'default')
    ).toBe('empty arr')
  })

  test('empty object matches same reference', () => {
    const obj = {}
    expect(
      match(obj)
        .on(obj, () => 'empty obj')
        .otherwise(() => 'default')
    ).toBe('empty obj')
  })

  // 29. Match with complex objects different by reference no match
  test('different object references do not match', () => {
    expect(
      match({})
        .on({} as Record<string, unknown>, () => 'matched')
        .otherwise(() => 'default')
    ).toBe('default')
  })

  // 30. Handler returns undefined explicitly
  test('handler returns undefined', () => {
    expect(
      match('foo')
        .on('foo', () => undefined)
        .otherwise(() => 'default')
    ).toBeUndefined()
  })

  // 31. Default handler returning undefined
  test('default handler returns undefined', () => {
    expect(
      match('bar')
        .on('foo', () => 'foo')
        .otherwise(() => undefined)
    ).toBeUndefined()
  })

  // 32. Chaining many .on calls
  test('many chained .on calls', () => {
    const result = match('x')
      .on('a', () => 'A')
      .on('b', () => 'B')
      .on('c', () => 'C')
      .on('x', () => 'X')
      .otherwise(() => 'default')

    expect(result).toBe('X')
  })

  // 33. Subject is NaN, does not match NaN key (NaN !== NaN)
  //   test('NaN subject never matches key NaN', () => {
  //     expect(
  //       match(NaN)
  //         .on(NaN, () => 'nan')
  //         .otherwise(() => 'default')
  //     ).toBe('default')
  //   })

  // 34. Subject is 0, matches 0 and -0 keys
  test('0 subject matches 0 key', () => {
    expect(
      match(0)
        .on(0, () => 'zero')
        .otherwise(() => 'default')
    ).toBe('zero')
  })

  test('0 subject matches -0 key', () => {
    expect(
      match(0)
        .on(-0, () => 'minus zero')
        .otherwise(() => 'default')
    ).toBe('minus zero')
  })

  // 35. Subject is symbol, matches same symbol key only
  test('symbol matching', () => {
    const sym = Symbol('test')
    expect(
      match(sym)
        .on(sym, () => 'matched')
        .otherwise(() => 'default')
    ).toBe('matched')
  })

  // 36. Subject is BigInt, matches same BigInt key only
  test('bigint matching', () => {
    expect(
      match(100n)
        .on(100n, () => 'bigint')
        .otherwise(() => 'default')
    ).toBe('bigint')
  })

  // 37. Multiple defaults (not allowed) - not applicable here, but test default called once
  test('default handler called once', () => {
    const defaultFn = jest.fn(() => 'default')
    const result = match('foo')
      .on('bar', () => 'bar')
      .otherwise(defaultFn)
    expect(result).toBe('default')
    expect(defaultFn).toHaveBeenCalledTimes(1)
  })

  // 38. Subject is function reference match
  test('function reference match', () => {
    const fn = () => 'hello'
    expect(
      match(fn)
        .on(fn, () => 'matched function')
        .otherwise(() => 'default')
    ).toBe('matched function')
  })

  // 39. Subject is function different reference no match
  test('different function reference no match', () => {
    expect(
      match(() => {})
        .on(
          () => {},
          () => 'matched function'
        )
        .otherwise(() => 'default')
    ).toBe('default')
  })

  // 40. Subject is a class instance
  test('class instance matching by reference', () => {
    class A {}
    const a = new A()
    expect(
      match(a)
        .on(a, () => 'matched instance')
        .otherwise(() => 'default')
    ).toBe('matched instance')
  })

  // 41. Subject is class instance no match with new instance
  test('different class instance no match', () => {
    class A {}
    expect(
      match(new A())
        .on(new A(), () => 'matched instance')
        .otherwise(() => 'default')
    ).toBe('default')
  })

  // 42. Subject is array, matches exact same array key
  test('array reference matching', () => {
    const arr = [1, 2]
    expect(
      match(arr)
        .on(arr, () => 'matched array')
        .otherwise(() => 'default')
    ).toBe('matched array')
  })

  // 43. Subject is array, different array no match
  test('different array no match', () => {
    expect(
      match([1, 2])
        .on([1, 2], () => 'matched array')
        .otherwise(() => 'default')
    ).toBe('default')
  })

  // 44. Calling .otherwise multiple times returns last result
  test('calling otherwise multiple times returns last', () => {
    const m = match('foo').on('foo', () => 'foo matched')
    expect(m.otherwise(() => 'default1')).toBe('foo matched')
    expect(m.otherwise(() => 'default2')).toBe('foo matched')
  })

  // 45. Using same handler for multiple keys (simulate by repeated on calls)
  test('same handler used for multiple keys', () => {
    const handler = jest.fn(() => 'handled')
    const m = match('bar')
      .on('foo', handler)
      .on('bar', handler)
      .otherwise(() => 'default')
    expect(m).toBe('handled')
    expect(handler).toHaveBeenCalledTimes(1)
  })

  // 46. Subject is an object with toString method - matching by reference only
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

  // 47. Subject is an array with overridden toString - matching by reference only
  test('array with overridden toString does not affect matching', () => {
    const arr = [1]
    arr.toString = () => 'foo'
    expect(
      match(arr)
        .on(arr, () => 'matched')
        .otherwise(() => 'default')
    ).toBe('matched')
  })

  //   // 48. Subject is a primitive number matching string key - no match
  //   test('number subject does not match string key', () => {
  //     expect(
  //       match(1)
  //         .on('1', () => 'string one')
  //         .otherwise(() => 'default')
  //     ).toBe('default')
  //   })

  //   // 49. Subject is string matching number key - no match
  //   test('string subject does not match number key', () => {
  //     expect(
  //       match('1')
  //         .on(1, () => 'number one')
  //         .otherwise(() => 'default')
  //     ).toBe('default')
  //   })

  //   // 50. Subject is a boolean matching string key - no match
  //   test('boolean subject does not match string key', () => {
  //     expect(
  //       match(true)
  //         .on('true', () => 'string true')
  //         .otherwise(() => 'default')
  //     ).toBe('default')
  //   })

  //   // 51. Subject is object matching null key - no match
  //   test('object subject does not match null key', () => {
  //     expect(
  //       match({})
  //         .on(null, () => 'null')
  //         .otherwise(() => 'default')
  //     ).toBe('default')
  //   })

  // 52. Handler can be async function (returns Promise)
  test('async handler returns Promise', async () => {
    const result = match('async')
      .on('async', async () => 'resolved')
      .otherwise(() => 'default')

    await expect(result).resolves.toBe('resolved')
  })
})
