# Roadmap

Known bugs and limitations surfaced during skill scaffolding (2026-06-02).
Each entry is tagged as **Bug** (behavior contradicts the API contract or
docs) or **Limitation** (intentional gap that is worth either fixing or
documenting explicitly).

## Playwright adapter

### Bug — `ByRoleOptions` other than `name` are silently dropped

`packages/testing-ui/src/adapters/playwright.ts:72-77` forwards only
`{ name }` to Playwright's `getByRole`. The shared `ByRoleOptions` type
exposes `checked`, `disabled`, `expanded`, `selected`, and `pressed`, and
`LocatorWith.checkbox()` / `radio()` / `tab()` accept the corresponding
options. Under RTL these are honored (`packages/testing-ui/src/adapters/rtl.ts`
also currently ignores them — see related limitation below). Under
Playwright, calls like `l.checkbox({ name: "Accept", checked: true })`
type-check but only filter by `name` at runtime.

Suggested fix: forward all supported options to Playwright (`getByRole`
supports `checked`, `disabled`, `expanded`, `pressed`, `selected`).

### Limitation — `getAll()` / `queryAll()` throw instead of returning a sync surface

`packages/testing-ui/src/adapters/playwright.ts:104-119` throws because
Playwright resolution is async. The thrown messages already point to
`await locator.get().all()`, which is the correct pattern, but the sync
signature on `LocatorMethods` is misleading. Options:

1. Keep current behavior and document it in the `wire-playwright` skill
   (current plan).
2. Remove `getAll`/`queryAll` from `LocatorMethods` and make them
   adapter-specific.
3. Provide an async-only `all()` on the shared `Locator` interface.

### Limitation — `find()` does not actually wait

Both adapters' `find()` returns the locator/element synchronously wrapped
in a Promise. Playwright's locators are inherently lazy, so this is
acceptable, but agents may expect `find()` to retry like RTL's `findBy*`.

## RTL adapter

### Bug — `ByRoleOptions` state filters (`checked`, `disabled`, ...) are not applied

`packages/testing-ui/src/adapters/rtl.ts:304-320` only filters by `name`.
Same symptom as the Playwright bug above: types advertise the options,
runtime ignores them.

Suggested fix: extend `findAllByRole` to check the relevant DOM property
or `aria-*` attribute for each option.

### Limitation — `getAll()` on the root locator returns `[root]`

`packages/testing-ui/src/adapters/rtl.ts:228-233`: if a locator has no
parent query, `resolveAll()` returns `[this.resolve()]`. Calling
`rtl(container).getAll()` therefore yields `[container]` rather than
behaving like a true "all matching" call. Likely fine for the current
API surface but worth a comment.

### Limitation — `byText` only matches leaf elements

`packages/testing-ui/src/adapters/rtl.ts:344-354` walks every element and
only considers nodes whose `children.length === 0`. This matches the
common-case "find the leaf text node" intent but differs from
`@testing-library/dom`'s default, which matches the deepest element whose
text content equals the query.

### Limitation — `isVisible()` only checks computed style

`packages/testing-ui/src/adapters/rtl.ts:184-192` checks `display`,
`visibility`, and `opacity`, but not `aria-hidden`, viewport visibility,
zero-size bounding box, or `hidden` attribute. Playwright's `isVisible()`
considers more signals; tests that pass under RTL may fail under
Playwright for the same DOM.

### Limitation — `fill()` without `userEvent` only works on inputs with a `value` descriptor

`packages/testing-ui/src/adapters/rtl.ts:370-378` (`setNativeValue`)
relies on `Object.getOwnPropertyDescriptor(proto, "value")`. Elements
without a `value` setter (contenteditable divs, custom elements) silently
no-op. Documenting "use `userEvent` for non-`<input>` editors" is
probably enough.

## Shared types

### Limitation — `LocatorMethods` mixes sync and async methods

Resolution methods are sync (`get`, `getAll`, `query`, `queryAll`), but
all actions and state queries return promises. This is the right shape
for RTL but forces the Playwright adapter into the awkward "sync resolve
returns a lazy Locator" pattern that produces the `getAll` throw above.
A future major version could split the interface or make resolution
async everywhere.

### Limitation — Type assertions inside the proxy implementation

`packages/testing-ui/src/enhanced.ts:44-53` and
`packages/testing-ui/src/callable.ts:11-27` use `as` casts because
TypeScript cannot model Proxy property addition. Internal-only — does
not affect users — but worth a refactor if a clean alternative appears.

## Documentation

### Gap — Accessibility-first locator priority is implied but not stated

The library's locator-with API and RTL adapter are designed around
role > label > text > placeholder > testId, matching React Testing
Library's guidance. The docs do not state this priority anywhere. This
is enforced as a CRITICAL/HIGH expectation in the agent skills; adding
it to `docs/getting-started.md` or a dedicated "Choosing selectors"
page would help human readers too.
