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
 *     console.error('No match found')
 *   }
 * }
 */
export class UnhandledMatchError extends Error {
  /**
   * Create an UnhandledMatchError
   *
   * @param {unknown} value The value that could not be matched
   */
  constructor(value: unknown) {
    super(`Unhandled match value: ${JSON.stringify(value)}`)
    this.name = 'UnhandledMatchError'
  }
}
