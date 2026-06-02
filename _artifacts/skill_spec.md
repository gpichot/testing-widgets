# testing-widgets — Skill Spec

`testing-widgets` is a Widget Object Model library: developers define UI selectors and actions once with a `widget()` factory, then connect that definition to either React Testing Library (`rtl`) or Playwright (`playwright`) via runner-agnostic adapters. The library has no runtime dependencies, ships its own DOM query engine for the RTL adapter, and uses structural typing for the Playwright adapter so neither peer is required at compile time.

## Domains

| Domain     | Description                                                                                              | Skills                                |
| ---------- | -------------------------------------------------------------------------------------------------------- | ------------------------------------- |
| authoring  | Designing widget definitions — selectors, elements vs actions, parameterization, composition.            | define-widget                         |
| wiring     | Connecting a widget definition to a specific runner and following that runner's resolution semantics.    | wire-rtl, wire-playwright             |

## Skill Inventory

| Skill            | Type      | Domain    | What it covers                                                                          | Failure modes |
| ---------------- | --------- | --------- | --------------------------------------------------------------------------------------- | ------------- |
| define-widget    | core      | authoring | widget() factory, LocatorWith API, role shortcuts, parameterized elements, composition. | 6             |
| wire-rtl         | framework | wiring    | rtl(container, user?), userEvent integration, sync resolution, exact-text semantics.    | 6             |
| wire-playwright  | framework | wiring    | playwright(page), lazy Locator semantics, sync getAll throws, ByRoleOptions caveats.    | 5             |

## Failure Mode Inventory

### define-widget (6 failure modes)

| # | Mistake                                          | Priority | Source                              | Cross-skill?               |
| - | ------------------------------------------------ | -------- | ----------------------------------- | -------------------------- |
| 1 | Bypassing the widget in test code                | CRITICAL | maintainer interview                | wire-rtl, wire-playwright  |
| 2 | Using testId instead of role/label               | HIGH     | maintainer interview; rtl.ts        | —                          |
| 3 | Resolving elements at definition time            | HIGH     | widget.ts; rtl.ts (lazy)            | —                          |
| 4 | Wrapping a static locator in a thunk             | MEDIUM   | ContactForm.widgets.ts              | —                          |
| 5 | Non-async multi-step actions                     | HIGH     | types.ts (Promise<void>)            | —                          |
| 6 | Re-declaring selectors instead of composing      | MEDIUM   | widget.test.ts (composition test)   | —                          |

### wire-rtl (6 failure modes)

| # | Mistake                                                       | Priority | Source                             | Cross-skill? |
| - | ------------------------------------------------------------- | -------- | ---------------------------------- | ------------ |
| 1 | Omitting userEvent                                            | HIGH     | rtl.ts (UserEventLike); docs       | —            |
| 2 | Asserting on the locator instead of the resolved element      | HIGH     | callable.ts; types.ts              | —            |
| 3 | Assuming substring text matching                              | MEDIUM   | rtl.ts (matches())                 | —            |
| 4 | Importing rtl from the root package entry                     | MEDIUM   | testing-ui/package.json (exports)  | —            |
| 5 | Scoping rtl() to document.body when a container is available  | MEDIUM   | rtl.ts (default container)         | —            |
| 6 | ByRole state filters silently ignored                         | CRITICAL | rtl.ts (findAllByRole)             | —            |

### wire-playwright (5 failure modes)

| # | Mistake                                                | Priority | Source                                  | Cross-skill? |
| - | ------------------------------------------------------ | -------- | --------------------------------------- | ------------ |
| 1 | Reaching for page.locator() inside tests               | CRITICAL | maintainer interview                    | —            |
| 2 | Calling getAll()/queryAll() on a Playwright locator    | HIGH     | playwright.ts (getAll/queryAll throw)   | —            |
| 3 | ByRole options silently dropped                        | CRITICAL | playwright.ts (only name forwarded)     | —            |
| 4 | Awaiting the callable shorthand                        | MEDIUM   | playwright.ts (get is sync)             | —            |
| 5 | Importing playwright adapter from the root entry       | MEDIUM   | testing-ui/package.json (exports)       | —            |

## Tensions

| Tension                                                              | Skills                                          | Agent implication                                                                                                  |
| -------------------------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Accessibility-first selectors vs the testId reflex                   | define-widget ↔ wire-rtl ↔ wire-playwright       | Agents reach for byTestId for stability; widgets end up disconnected from user-facing semantics.                   |
| Sync RTL semantics vs lazy Playwright semantics in shared widgets    | define-widget ↔ wire-rtl ↔ wire-playwright       | Code written for one adapter assumes a return shape the other does not provide; failures are silent until runtime. |

## Cross-References

| From            | To              | Reason                                                                                          |
| --------------- | --------------- | ----------------------------------------------------------------------------------------------- |
| define-widget   | wire-rtl        | After a widget is defined, the typical next step is using it in a vitest+RTL test.              |
| define-widget   | wire-playwright | The same widget must also work under Playwright with lazy/async resolution.                     |
| wire-rtl        | wire-playwright | Porting a test between runners reveals where widget definitions need to stay portable.          |
| wire-playwright | wire-rtl        | Same reasoning in the other direction.                                                          |

## Subsystems & Reference Candidates

| Skill            | Subsystems | Reference candidates                                                              |
| ---------------- | ---------- | --------------------------------------------------------------------------------- |
| define-widget    | —          | Role shortcuts table (15 roles with options) — covered by docs/api/locator-with.  |
| wire-rtl         | —          | Implicit role map (10 roles → selectors) — covered by docs/adapters/rtl.          |
| wire-playwright  | —          | Resolution differences table — covered by docs/adapters/playwright.               |

## Remaining Gaps

None — gaps were resolved in the interview round.

## Recommended Skill File Structure

- **Core skills:** `define-widget`
- **Framework skills:** `wire-rtl`, `wire-playwright`
- **Lifecycle skills:** none — library is at v0.1.0; no migration paths yet.
- **Composition skills:** none — maintainer asked to keep ecosystem coverage minimal.
- **Reference files:** none — dense surfaces (role shortcuts, implicit role map) are short enough to inline in each SKILL.md.

All three skills live in `packages/testing-ui/skills/<skill-slug>/SKILL.md`.

## Composition Opportunities

| Library                          | Integration points                                                                       | Composition skill needed?                                                  |
| -------------------------------- | ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| @testing-library/react           | rtl(container, user) requires render's container; userEvent.setup() for realistic input. | No — folded into `wire-rtl`.                                               |
| @testing-library/user-event      | Optional but recommended; rtl() click/fill/clear/selectOption delegate when provided.    | No — folded into `wire-rtl`.                                               |
| @playwright/test                 | playwright(page) accepts Page or Locator; assertions via @playwright/test expect().      | No — folded into `wire-playwright`.                                        |
