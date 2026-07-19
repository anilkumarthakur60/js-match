/**
 * Build a human-readable description of an unmatched subject.
 *
 * This must be a *total* function: it runs inside `UnhandledMatchError`'s
 * constructor, so anything it throws would escape in place of the error the
 * caller is documented to catch, breaking `instanceof UnhandledMatchError`.
 * `JSON.stringify` alone is not total — it throws on BigInt and on circular
 * structures, and it propagates whatever a user `toJSON()` hook throws.
 *
 * @param {unknown} value The value to describe
 * @returns {string} A best-effort description, never throwing
 */
function describeValue(value: unknown): string {
  // These types either make JSON.stringify throw (bigint) or make it return
  // `undefined`/`null`, which would render symbols, functions and NaN
  // indistinguishable from a genuinely `undefined` subject.
  switch (typeof value) {
    case 'bigint':
      return `${String(value)}n`
    case 'symbol':
      return value.toString()
    case 'undefined':
      return 'undefined'
    case 'number':
      // NaN and ±Infinity serialise to `null` under JSON; String keeps them honest.
      return String(value)
    case 'function':
      return value.name === '' ? '[Function (anonymous)]' : `[Function: ${value.name}]`
    default:
      break
  }

  // Collections stringify to a useless `{}` because their contents live in
  // internal slots rather than own properties.
  if (value instanceof Map) return `Map(${String(value.size)})`
  if (value instanceof Set) return `Set(${String(value.size)})`

  try {
    // lib.dom types this as `string`, but it genuinely returns undefined for
    // values JSON drops (a toJSON hook returning undefined, for instance).
    const json = JSON.stringify(value) as string | undefined
    if (json !== undefined) return json
  } catch {
    // Circular reference or a throwing toJSON — fall through to the tag below.
  }

  try {
    return Object.prototype.toString.call(value)
  } catch {
    // A Proxy can throw from its `get` trap when @@toStringTag is read.
    return '[unserialisable value]'
  }
}

/**
 * Error thrown when a match expression has no matching case and no default handler
 *
 * @class UnhandledMatchError
 * @extends Error
 *
 * @example
 * try {
 *   match('foo')
 *     .on('bar', () => 'never matches')
 *     .valueOf()
 * } catch (error) {
 *   if (error instanceof UnhandledMatchError) {
 *     console.error('No match found for', error.value)
 *   }
 * }
 */
export class UnhandledMatchError extends Error {
  /**
   * The raw value that could not be matched.
   *
   * Exposed so consumers can branch on the actual subject instead of parsing
   * the message, which is lossy by design for exotic values.
   */
  readonly value: unknown

  /**
   * Create an UnhandledMatchError
   *
   * @param {unknown} value The value that could not be matched
   */
  constructor(value: unknown) {
    super(`Unhandled match value: ${describeValue(value)}`)
    this.name = 'UnhandledMatchError'
    this.value = value
  }
}
