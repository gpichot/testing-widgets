# Roadmap

Known bugs and limitations surfaced during skill scaffolding (2026-06-02).
Each entry is tagged as **Bug** (behavior contradicts the API contract or
docs) or **Limitation** (intentional gap that is worth either fixing or
documenting explicitly).

## Playwright adapter

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

## RTL adapter

### Limitation — `getAll()` on the root locator returns `[root]`

`packages/testing-ui/src/adapters/rtl.ts`: the root locator's candidates are `[container]`. Calling
`rtl(container).getAll()` therefore yields `[container]` rather than
behaving like a true "all matching" call. Likely fine for the current
API surface but worth a comment.

### Limitation — `isVisible()` only checks computed style

`RtlLocator.isVisible()` checks `display`,
`visibility`, and `opacity`, but not `aria-hidden`, viewport visibility,
zero-size bounding box, or `hidden` attribute. Playwright's `isVisible()`
considers more signals; tests that pass under RTL may fail under
Playwright for the same DOM.

### Limitation — `fill()` without `userEvent` only works on inputs with a `value` descriptor

`setNativeValue` in `packages/testing-ui/src/adapters/rtl.ts`
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
