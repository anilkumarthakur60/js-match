import { UnhandledMatchError } from '../src/errors'

/**
 * Regression suite for the message-construction totality bug: the constructor
 * used to call `JSON.stringify` bare, so exotic subjects made a raw TypeError
 * escape instead of the UnhandledMatchError consumers are told to catch.
 */
describe('UnhandledMatchError message construction', () => {
  const messageFor = (value: unknown): string => new UnhandledMatchError(value).message

  describe('never throws while constructing', () => {
    test('BigInt subject yields an UnhandledMatchError, not a TypeError', () => {
      let caught: unknown
      try {
        throw new UnhandledMatchError(10n)
      } catch (error) {
        caught = error
      }
      expect(caught).toBeInstanceOf(UnhandledMatchError)
      expect((caught as UnhandledMatchError).message).toBe('Unhandled match value: 10n')
    })

    test('circular structures degrade to a structural tag', () => {
      const circular: { self?: unknown } = {}
      circular.self = circular
      expect(messageFor(circular)).toBe('Unhandled match value: [object Object]')
    })

    test('a throwing toJSON hook does not replace the error', () => {
      const hostile = {
        toJSON(): never {
          throw new Error('toJSON exploded')
        }
      }
      expect(() => new UnhandledMatchError(hostile)).not.toThrow()
      expect(messageFor(hostile)).toBe('Unhandled match value: [object Object]')
    })

    test('a toJSON hook returning undefined falls back to the structural tag', () => {
      const erased = { toJSON: (): undefined => undefined }
      expect(messageFor(erased)).toBe('Unhandled match value: [object Object]')
    })

    test('a Proxy that throws from its get trap still produces a message', () => {
      const hostile = new Proxy(
        {},
        {
          get(): never {
            throw new Error('trap exploded')
          }
        }
      )
      expect(messageFor(hostile)).toBe('Unhandled match value: [unserialisable value]')
    })
  })

  describe('describes exotic subjects usefully', () => {
    test('symbols are distinguishable from undefined', () => {
      expect(messageFor(Symbol('s'))).toBe('Unhandled match value: Symbol(s)')
      expect(messageFor(undefined)).toBe('Unhandled match value: undefined')
    })

    test('NaN and Infinity are not reported as null', () => {
      expect(messageFor(Number.NaN)).toBe('Unhandled match value: NaN')
      expect(messageFor(Number.POSITIVE_INFINITY)).toBe('Unhandled match value: Infinity')
    })

    test('finite numbers render plainly', () => {
      expect(messageFor(42)).toBe('Unhandled match value: 42')
    })

    test('functions are identified by name', () => {
      function namedHandler(): void {
        /* body irrelevant */
      }
      expect(messageFor(namedHandler)).toBe('Unhandled match value: [Function: namedHandler]')
      expect(messageFor(function (): void {})).toBe('Unhandled match value: [Function (anonymous)]')
    })

    test('Map and Set report their size instead of {}', () => {
      expect(messageFor(new Map([['a', 1]]))).toBe('Unhandled match value: Map(1)')
      expect(messageFor(new Set([1, 2]))).toBe('Unhandled match value: Set(2)')
    })

    test('JSON-serialisable subjects keep their existing rendering', () => {
      expect(messageFor('test')).toBe('Unhandled match value: "test"')
      expect(messageFor(null)).toBe('Unhandled match value: null')
      expect(messageFor(true)).toBe('Unhandled match value: true')
      expect(messageFor({ key: 'value' })).toBe('Unhandled match value: {"key":"value"}')
    })
  })

  describe('exposes the raw subject', () => {
    test('value holds the untouched subject for exotic types', () => {
      const subject = Symbol('inspect-me')
      expect(new UnhandledMatchError(subject).value).toBe(subject)
      expect(new UnhandledMatchError(10n).value).toBe(10n)
      expect(new UnhandledMatchError(undefined).value).toBeUndefined()
    })
  })
})
