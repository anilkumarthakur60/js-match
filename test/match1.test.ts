import { match } from '../src/Matcher'

describe('match function', () => {
  test('executes the matching handler when subject matches an on condition', () => {
    const result = match('success')
      .on('success', () => 'success-handler')
      .on('error', () => 'error-handler')
      .otherwise(() => 'otherwise-handler')

    expect(result).toBe('success-handler')
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

  test('executes otherwise handler if no conditions match', () => {
    const result = match('not-found')
      .on('success', () => 'success-handler')
      .on('error', () => 'error-handler')
      .otherwise(() => 'otherwise-handler')

    expect(result).toBe('otherwise-handler')
  })

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

  test('executes otherwise if no handler is defined at all', () => {
    const result = match('anything').otherwise(() => 'no-cases')
    expect(result).toBe('no-cases')
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
