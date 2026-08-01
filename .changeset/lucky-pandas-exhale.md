---
'@anilkumarthakur/match': minor
---

Add compile-time exhaustiveness checking and guard combinators.

**`.exhaustive()`** — the checked counterpart to `get()`. It resolves the chain with no fallback, and
only compiles once every member of the subject's union has an arm:

```typescript
type Status = 'active' | 'archived' | 'draft'

match<Status, string>(status)
  .on('active', () => 'Live')
  .on('archived', () => 'Archived')
  .exhaustive()
//   ~~~~~~~~~~ Expected 1 arguments, but got 0.
//              Parameter type: NonExhaustive<"draft">
```

The payoff is on the next change rather than today's: add a member to `Status` and every
`.exhaustive()` chain over it fails the build until handled, where a `switch` default or an
`.otherwise()` would silently take the fallback branch. `onAny()` participates too, covering every
value it lists. It still throws `UnhandledMatchError` at runtime, since the guarantee is only as
strong as the subject's declared type.

Only literal arms count towards coverage — a predicate's outcome is not knowable statically, so a
guard leaves the remainder untouched, and open-ended subjects like `string` are never exhaustible.
Both are deliberate: the alternative is a guarantee the library cannot honour.

**`not` / `allOf` / `anyOf`** — combinators that build one `Predicate<T>` from several, so a composed
guard stays readable at the call site:

```typescript
match(user)
  .on(allOf(isVerified, not(isSuspended)), () => 'ok')
  .on(anyOf(isAdmin, isOwner), () => 'privileged')
  .otherwise(() => 'blocked')
```

They short-circuit left to right like `&&`/`||`, and their empty cases follow
`Array.prototype.every`/`some` (`allOf()` matches everything, `anyOf()` matches nothing) so a
possibly-empty condition list can be spread into either.

Also exports two new types, `Unmatched` and `NonExhaustive`, which drive the check.

No breaking changes: `on()` and `onAny()` gained an inferred `const` type parameter for the pattern,
but their existing call signatures, runtime behaviour and inference are unchanged.
