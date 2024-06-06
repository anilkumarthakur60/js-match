import { match } from '../match.ts'

describe('match function', () => {
  it('should return the correct action for the matched case', () => {
    const result = match('test')
      .on('test', () => 'matched')
      .on('not matched', () => 'not matched')
      .otherwise(() => 'otherwise')
    expect(result).toBe('matched')
    expect(result).not.toBe('not matched')
  })

  it('should return the otherwise action if no cases are matched', () => {
    const result = match('test')
      .on('not matched', () => 'not matched')
      .otherwise(() => 'otherwise')
    expect(result).toBe('otherwise')
    expect(result).not.toBe('not matched')
  })

  it('should correctly handle multiple cases with one match', () => {
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

  it('should execute the default action when provided', () => {
    const result = match('none')
      .on('first', () => 'first case')
      .on('second', () => 'second case')
      .otherwise(() => 'default action')
    expect(result).toBe('default action')
    expect(result).not.toBe('first case')
    expect(result).not.toBe('second case')
  })

  it('should correctly handle no cases with only otherwise', () => {
    const result = match('none').otherwise(() => 'default action')
    expect(result).toBe('default action')
    expect(result).not.toBe('first case')
  })

  it('should correctly handle default true parameter', () => {
    const result = match(true)
      .on(true, () => true)
      .otherwise(() => 'default action')
    expect(result).toBe(true)
    expect(result).not.toBe('default action')
  })

  it('should correctly handle default false parameter', () => {
    const result = match(true)
      .on(true, () => 'true case')
      .otherwise(() => 'default action')
    expect(result).toBe('true case')
    expect(result).not.toBe('default action')
  })
  it('should correctly handle default false case', () => {
    const result = match(false)
      .on(true, () => true)
      .otherwise(() => 'default action')
    expect(result).toBe('default action')
    expect(result).not.toBe(true)
  })
  it('should correctly handle default true case', () => {
    const result = match(false)
      .on(false, () => false)
      .otherwise(() => 'default action')
    expect(result).toBe(false)
    expect(result).not.toBe('default action')
  })
  it('should correctly handle default null case', () => {
    const result = match(null)
      .on(null, () => null)
      .otherwise(() => 'default action')
    expect(result).toBe(null)
    expect(result).not.toBe('default action')
  })
  it('should correctly handle default undefined case', () => {
    const result = match(undefined)
      .on(undefined, () => undefined)
      .otherwise(() => 'default action')
    expect(result).toBe(undefined)
    expect(result).not.toBe('default action')
  })
  it('Match function test', () => {
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
