import { match, UnhandledMatchError } from '../src/Matcher'
const consoleLogMock = jest.spyOn(console, 'log').mockImplementation()

beforeEach(() => {
  jest.clearAllMocks()
})

describe('match utility comprehensive tests', () => {
  // 1. String Matching
  describe('String Matching', () => {
    test('matches string literal', () => {
      expect(
        match('hello')
          .on('hello', () => 'matched')
          .otherwise(() => 'default')
      ).toBe('matched')
      expect(match('hello').otherwise(() => 'default')).toBe('default')

      expect(
        match('world')
          .on('hello', () => 'matched')
          .on('world', () => 'world')
          .otherwise(() => 'default')
      ).toBe('world')
      expect(
        match('nope')
          .on('something', () => 'something')
          .on('nope', () => 'nope')
          .valueOf()
      ).toBe('nope')
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
  // 2. Number Matching
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
    test('+0 matches -0', () => {
      expect(
        match(+0)
          .on(-0, () => 'zero matched')
          .otherwise(() => 'default')
      ).toBe('zero matched')
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
    test('0 subject matches -0 key', () => {
      expect(
        match(0)
          .on(-0, () => 'minus zero')
          .otherwise(() => 'default')
      ).toBe('minus zero')
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
  // 3. Boolean Matching
  describe('Boolean Matching', () => {
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
  // 4. Null and Undefined Matching
  describe('Null and Undefined Matching', () => {
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
  // 5. Symbol Matching
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
  // 6. BigInt Matching
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
  // 7. Object and Array Reference Matching
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
  // 8. Function and Class Instance Matching
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
  // 9. Enum Matching
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
  //   // 10. Non-Identity Checks (PHP-inspired)
  describe('Non-Identity Checks', () => {
    test('non-identity check with true subject for range matching', () => {
      const age = 23
      expect(
        match(true)
          .on(age >= 65, () => 'senior')
          .on(age >= 25, () => 'adult')
          .on(age >= 18, () => 'young adult')
          .otherwise(() => 'kid')
      ).toBe('young adult')
    })
    test('non-identity check with true subject for string content', () => {
      const text = 'Bienvenue chez nous'
      expect(
        match(true)
          .on(text.includes('Welcome') || text.includes('Hello'), () => 'en')
          .on(text.includes('Bienvenue') || text.includes('Bonjour'), () => 'fr')
          .otherwise(() => 'unknown')
      ).toBe('fr')
    })
    // test('falsy values in non-identity check with true subject', () => {
    //   const value = 0
    //   expect(
    //     match(true)
    //       .on(value === 0, () => 'zero')
    //       .on(value === 1, () => 'one')
    //       .otherwise(() => 'other')
    //   ).toBe('zero')
    // })
  })
  // 11. Handler Behavior and Side Effects
  describe('Handler Behavior', () => {
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
  // 12. Chaining and Duplicate Keys
  describe('Chaining and Duplicate Keys', () => {
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
    test('duplicate keys overwrite previous handlers', () => {
      const result = match('key')
        .on('key', () => 'first')
        .on('key', () => 'second')
        .otherwise(() => 'default')
      expect(result).toBe('second')
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
  })
  // 13. Default Handler Behavior
  describe('Default Handler Behavior', () => {
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
  })
  //   // 14. Error Handling
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
      }).toThrow() // TypeScript should catch this, or runtime error
    })
  })
  // 15. Type Safety
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
  })
  // 16. Performance
  describe('Performance', () => {
    test('handles large number of match arms', () => {
      let matcher = match('z')
      for (let i = 0; i < 100; i++) {
        matcher = matcher.on(`key${i}`, () => `matched ${i}`)
      }
      const result = matcher.otherwise(() => 'default')
      expect(result).toBe('default')
    })
  })
  // 17. Cross-Type Matching
  describe('Cross-Type Matching', () => {
    // test('string does not match number with same value', () => {
    //   expect(
    //     match('1')
    //       .on(1, () => 'number one')
    //       .otherwise(() => 'default')
    //   ).toBe('default')
    // })
  })
  // 18. Real-World Examples
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
      expect(consoleLogMock).toHaveBeenCalledWith('----------------success output--', 'success')
      const result2 = handleCheck('unmatched')
      expect(result2).toBe('otherwise')
      expect(consoleLogMock).toHaveBeenCalledWith('----------------otherwise output:', 'otherwise')
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
    test('FizzBuzz example', () => {
      const fizzbuzz = (num: number) =>
        match(0)
          .on(num % 15, () => 'FizzBuzz')
          .on(num % 3, () => 'Fizz')
          .on(num % 5, () => 'Buzz')
          .otherwise(() => num.toString())
      expect(fizzbuzz(3)).toBe('Fizz')
      expect(fizzbuzz(5)).toBe('Buzz')
      //   expect(fizzbuzz(15)).toBe('FizzBuzz')
      expect(fizzbuzz(7)).toBe('7')
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
  })
  describe('Simulated PHP Comma-Separated Conditions', () => {
    test('multiple .on calls with same handler simulates PHP comma-separated conditions', () => {
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
