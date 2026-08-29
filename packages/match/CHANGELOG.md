# @anilkumarthakur/match

## 0.2.0

### Minor Changes

- c2caf25: Fix a broken error path, infer result types, ship a browser build, and correct documentation that was wrong in 17 places.

  **Fixed**

  - **`UnhandledMatchError` could not be caught for some subjects.** Its message was built with `JSON.stringify`, which is not a total function: a BigInt, a circular object, or an object whose `toJSON` throws made the _constructor itself_ throw, so a raw `TypeError` escaped and `error instanceof UnhandledMatchError` was `false`  silently defeating the error handling the README and docs tell you to write. BigInt is explicitly documented as a supported subject type, and matching it worked; only the unmatched path was broken. Message construction is now total.
  - Error messages are now useful for values JSON cannot represent: `NaN`/`Infinity` were reported as `null`, and symbols, functions and `undefined` were _all_ reported as `undefined`. They now render as `NaN`, `Symbol(x)`, `[Function: x]` and `undefined` respectively, and `Map`/`Set` as `Map(n)`/`Set(n)` instead of `{}`.

  **New**

  - **`Matcher#get()`**  an explicit terminal accessor, and the recommended replacement for `valueOf()`. `valueOf` is a slot in JavaScript's `ToPrimitive` protocol, so the engine calls it on _any_ implicit coercion (`matcher + 1`, `matcher == x`, a sort comparator). That made an unmatched chain throw from expressions that never mention the method. `valueOf()` still works and delegates to `get()`, but is now deprecated.
  - **`UnhandledMatchError#value`** exposes the raw unmatched subject, so you can inspect it without parsing the message.
  - **A browser global build.** `dist/index.global.js` exposes `JsMatch` and the `unpkg`/`jsdelivr` fields are set, so the library works from a plain `<script>` tag with no bundler.
  - **CommonJS type declarations.** The package previously shipped a single `types` entry for both conditions; `require()` consumers on `moduleResolution: "node16"` now get real types from a proper `.d.cts` instead of falling back to `any`.

  **Types**

  - **Handler return types are now inferred.** `match('a').on('a', () => 42).otherwise(() => 0)` resolves to `number` rather than `unknown`, and handlers returning different types produce a union. The explicit form `match<string, string>(x)` still pins every handler to that one type as before.
  - On an explicitly pinned chain, a handler returning the wrong type is now a **compile error** instead of being silently accepted.
  - `MatchChain` now actually describes `Matcher`  it previously omitted `onAny`, `default`, `valueOf` and `run`, and rejected predicates that the implementation accepts.
  - Passing a predicate when the subject is itself a function is now a compile error. That code was already dead at runtime (the predicate was never invoked and the case fell through silently), so this surfaces a latent bug rather than breaking working code.

  **Documentation**

  Seventeen corrections, every remaining example re-verified by execution. Highlights: the `type-safety.md` generics example threw a `TypeError`; the UMD install section pointed at a file that does not exist and named the wrong global; "uses JavaScript's `Map` for O(1) lookup" was false in three places (there is no `Map`  matching is linear); the advertised test counts (127 and 245) were both wrong; matching was documented as `===` when it uses `Object.is` (so `NaN` matches `NaN`, and `+0` does not match `-0`); and Node.js 14+ was claimed against an `engines` field of `>=22`.

  **Packaging**

  - **The package no longer ships its test suite.** `files` was `["dist", "test"]`, so every install included the full test file. The tarball is now 8 KB.
  - **A LICENSE file is now included.** The package declared `"license": "MIT"` and listed `LICENSE` in `files`, but no license text existed anywhere in the repository.
  - **The supported Node.js range is now `>=22`.** `engines.node` moved up from `>=20` (Node 20 reached end-of-life), and CI now tests Node 22, 24 and 26. Installing on Node 20 or older fails with `EBADENGINE` (npm) / `ERR_PNPM_UNSUPPORTED_ENGINE` (pnpm).

  **Upgrade notes**

  Runtime behaviour is unchanged except for `UnhandledMatchError` messages, which only differ for subjects that JSON could not serialise. The type changes can surface new compile errors, all of which indicate pre-existing problems  except one ergonomic regression: reassigning a chain variable in a loop now needs an explicit annotation, because `.on()` folds each handler's return type into the chain type. Write `let m = match<string, string>('x')` instead of `let m = match('x')`.
