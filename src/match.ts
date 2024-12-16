// import { Match } from './types/main'

import { Handler, MatchChain } from './types/main'

// const match = <T, U>(value: T) => {
//   const cases: Match<T, U>[] = []
//   let defaultAction: (() => U) | null = null

//   const matcher = {
//     on: (expected: T, action: () => U) => {
//       const predicate = (val: T) => val === expected
//       cases.push({ predicate, action })
//       return matcher
//     },
//     otherwise: (action: () => U): U => {
//       defaultAction = action
//       return execute()
//     }
//   }

//   const execute = (): U => {
//     for (const { predicate, action } of cases) {
//       if (predicate(value)) {
//         return action()
//       }
//     }
//     if (defaultAction) {
//       return defaultAction()
//     }
//     throw new Error('No match found and no default action provided.')
//   }

//   return matcher
// }

// export { match }

function match<T = unknown>(subject: any): MatchChain<T> {
  const cases: Array<{ value: any; handler: Handler<T> }> = []

  return {
    on(value: any, handler: Handler<T>) {
      cases.push({ value, handler })
      return this
    },
    otherwise(handler: Handler<T>) {
      // Check each case
      for (const c of cases) {
        if (c.value === subject) {
          // Found a matching case
          return c.handler()
        }
      }
      // If none matched, call otherwise handler
      return handler()
    }
  }
}

export { match }
export type { MatchChain }
