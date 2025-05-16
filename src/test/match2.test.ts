import { match } from '../match'

describe('match function with various data types and complex use cases', () => {
  test('complex scenario covering strings, numbers, arrays, objects, booleans, null, undefined', () => {
    const testObject = { key: 'value' }
    const differentRefObject = { key: 'value' }
    const testArray = [1, 2, 3]
    const differentRefArray = [1, 2, 3]

    const consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {})

    // We'll try multiple subjects and ensure the correct handlers match
    // by reusing the same chain logic with different inputs.
    // We'll store results in an array and check them afterwards.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results: any[] = []

    const runMatch = (subject: unknown) => {
      // This match setup covers a wide variety of values.
      // We'll log something in each handler to ensure we know which one fired.
      return (
        match(subject)
          // String conditions
          .on('hello', () => {
            console.log('matched hello')
            return 'handler_hello'
          })
          .on('world', () => {
            console.log('matched world')
            return 'handler_world'
          })

          // Number conditions
          .on(42, () => {
            console.log('matched 42')
            return 'handler_42'
          })
          .on(0, () => {
            console.log('matched 0')
            return 'handler_0'
          })

          // Boolean conditions
          .on(true, () => {
            console.log('matched true')
            return 'handler_true'
          })
          .on(false, () => {
            console.log('matched false')
            return 'handler_false'
          })

          // Null and undefined conditions
          .on(null, () => {
            console.log('matched null')
            return 'handler_null'
          })
          .on(undefined, () => {
            console.log('matched undefined')
            return 'handler_undefined'
          })

          // Object and array conditions
          .on(testObject, () => {
            console.log('matched testObject')
            return 'handler_testObject'
          })
          .on(testArray, () => {
            console.log('matched testArray')
            return 'handler_testArray'
          })

          // Duplicate condition scenarios - first match wins
          .on('hello', () => {
            console.log('matched hello again, should never reach here if first hello matched')
            return 'handler_hello_second'
          })

          // Otherwise
          .otherwise(() => {
            console.log('matched otherwise')
            return 'handler_otherwise'
          })
      )
    }

    // Test each subject and store the result
    results.push({ subject: 'hello', result: runMatch('hello') }) // matches first 'hello'
    results.push({ subject: 'world', result: runMatch('world') }) // matches 'world'
    results.push({ subject: 42, result: runMatch(42) }) // matches 42
    results.push({ subject: 0, result: runMatch(0) }) // matches 0
    results.push({ subject: true, result: runMatch(true) }) // matches true
    results.push({ subject: false, result: runMatch(false) }) // matches false
    results.push({ subject: null, result: runMatch(null) }) // matches null
    results.push({ subject: undefined, result: runMatch(undefined) }) // matches undefined
    results.push({ subject: testObject, result: runMatch(testObject) }) // matches testObject (same ref)
    results.push({ subject: testArray, result: runMatch(testArray) }) // matches testArray (same ref)

    // For objects/arrays with different references but identical content:
    results.push({ subject: differentRefObject, result: runMatch(differentRefObject) })
    // should not match testObject since differentRefObject is a different reference
    // Expect otherwise

    results.push({ subject: differentRefArray, result: runMatch(differentRefArray) })
    // should not match testArray since differentRefArray is a different reference
    // Expect otherwise

    // For something completely unmatched:
    results.push({ subject: 'unmatched_string', result: runMatch('unmatched_string') })
    results.push({ subject: 999, result: runMatch(999) })
    results.push({ subject: { some: 'otherObject' }, result: runMatch({ some: 'otherObject' }) })
    results.push({ subject: [9, 9, 9], result: runMatch([9, 9, 9]) })

    // Verify results
    expect(results).toEqual([
      { subject: 'hello', result: 'handler_hello' },
      { subject: 'world', result: 'handler_world' },
      { subject: 42, result: 'handler_42' },
      { subject: 0, result: 'handler_0' },
      { subject: true, result: 'handler_true' },
      { subject: false, result: 'handler_false' },
      { subject: null, result: 'handler_null' },
      { subject: undefined, result: 'handler_undefined' },
      { subject: testObject, result: 'handler_testObject' },
      { subject: testArray, result: 'handler_testArray' },

      // Different references should go to otherwise
      { subject: differentRefObject, result: 'handler_otherwise' },
      { subject: differentRefArray, result: 'handler_otherwise' },

      // Unmatched values go to otherwise
      { subject: 'unmatched_string', result: 'handler_otherwise' },
      { subject: 999, result: 'handler_otherwise' },
      { subject: { some: 'otherObject' }, result: 'handler_otherwise' },
      { subject: [9, 9, 9], result: 'handler_otherwise' }
    ])

    // Check console calls for a couple of them to ensure correct arm execution:
    // Just a spot check for 'hello' and '42'
    expect(consoleSpy).toHaveBeenCalledWith('matched hello') // For the 'hello' subject
    expect(consoleSpy).toHaveBeenCalledWith('matched 42') // For the '42' subject

    // Check that duplicates (like 'hello') didn't trigger second 'hello'
    expect(consoleSpy).not.toHaveBeenCalledWith(
      'matched hello again, should never reach here if first hello matched'
    )

    consoleSpy.mockRestore()
  })
})
