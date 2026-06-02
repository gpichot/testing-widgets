---
name: wire-rtl
description: >
  Adopt a testing-widgets widget definition inside a Vitest + React
  Testing Library suite. Load this skill when wiring an existing widget
  into RTL tests via rtl(container, user), passing @testing-library/
  user-event for realistic interactions, asserting on resolved elements
  (locator() or .get()), handling exact-vs-RegExp matching for byText/
  byLabel/byPlaceholder, importing from testing-widgets/adapters/rtl,
  or migrating existing screen.getByX() tests to go through the widget.
type: framework
library: testing-widgets
framework: react
library_version: "0.1.0"
requires:
  - define-widget
sources:
  - "gpichot/testing-widgets:packages/testing-ui/src/adapters/rtl.ts"
  - "gpichot/testing-widgets:packages/testing-ui/src/__tests__/rtl-adapter.test.ts"
  - "gpichot/testing-widgets:packages/docs/src/content/docs/adapters/rtl.md"
  - "gpichot/testing-widgets:packages/example-react/tests/contact-form.test.tsx"
  - "gpichot/testing-widgets:packages/testing-ui/package.json"
---

This skill builds on `define-widget`. Read that first for how to author
the widget being wired here.

# testing-widgets — Wire RTL

The `rtl` adapter connects a widget to a vitest + `@testing-library/react`
test. It ships its own DOM query engine — no `@testing-library/dom`
dependency.

## Setup

```ts
// tests/contact-form.test.tsx
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rtl } from "testing-widgets/adapters/rtl";
import { describe, expect, it } from "vitest";
import { ContactForm } from "../src/ContactForm.js";
import { contactForm } from "../src/ContactForm.widgets.js";

function setup() {
  const user = userEvent.setup();
  const { container } = render(<ContactForm />);
  return contactForm.from(rtl(container, user));
}

describe("ContactForm", () => {
  it("submits and shows confirmation", async () => {
    const { elements, actions } = setup();
    await actions.submitForm("Alice", "Hello!");
    expect(elements.thankYou("Alice").get()).toHaveTextContent("Thank you, Alice!");
    expect(elements.confirmation()).toHaveTextContent("Your message has been sent.");
  });
});
```

## Core Patterns

### Always pass `userEvent` for realistic interactions

```ts
const user = userEvent.setup();
const { container } = render(<MyForm />);
const wf = myForm.from(rtl(container, user));
await wf.actions.fillName("Alice"); // delegates to user.type
```

Without `user`, `click()` falls back to `el.click()` and `fill()` writes
to the input's `value` descriptor and dispatches `input`/`change`. That
works for plain DOM but skips key events, focus changes, and other
behaviors that controlled React inputs often depend on.

### Resolve elements via call shorthand or `.get()`

Locators are callable. These are equivalent:

```ts
expect(elements.heading()).toHaveTextContent("Hi");
expect(elements.heading.get()).toHaveTextContent("Hi");
```

For optional elements use `.query()` (returns `null` instead of throwing):

```ts
expect(elements.errorBanner.query()).toBeNull();
```

For collections use `.getAll()` / `.queryAll()` on a scoped locator:

```ts
const rows = wf.elements.list.getByRole("row").getAll();
expect(rows).toHaveLength(3);
```

### Use RegExp for partial / case-insensitive text matching

String queries are EXACT (`actual === expected`). Use a RegExp for
anything looser:

```ts
l.byText(/submitted/i)             // partial, case-insensitive
l.byLabel(/^email$/i)              // exact, case-insensitive
l.button({ name: /^save( draft)?$/ })
```

### Subpath import for the adapter

```ts
import { rtl } from "testing-widgets/adapters/rtl";  // ✅
```

The adapter is only exposed under the `testing-widgets/adapters/rtl`
subpath; the root `testing-widgets` export does not include it.

## Common Mistakes

### CRITICAL Bypassing the widget in test code

Wrong:

```ts
import { screen } from "@testing-library/react";
render(<ContactForm />);
screen.getByRole("button", { name: "Send" }).click();
expect(screen.getByText("Your message has been sent.")).toBeVisible();
```

Correct:

```ts
const { container } = render(<ContactForm />);
const { elements, actions } = contactForm.from(rtl(container, userEvent.setup()));
await actions.submit();
expect(elements.confirmation()).toBeVisible();
```

The widget is the single source of truth for selectors. `screen.*`
queries inside the test body re-introduce the duplication the library
exists to remove.

Source: maintainer-defined antipattern; packages/example-react/tests/contact-form.test.tsx (canonical pattern)

### CRITICAL `ByRole` state filters silently ignored

Wrong:

```ts
elements: {
  // `checked: true` is accepted by the type but ignored at runtime —
  // every checkbox named "Accept" matches.
  accepted: l.checkbox({ name: "Accept", checked: true }),
}
```

Correct:

```ts
elements: {
  acceptBox: l.checkbox({ name: "Accept" }),
}
// assert state instead of filtering by it:
expect(elements.acceptBox()).toBeChecked();
```

`findAllByRole` in the RTL adapter only checks `options.name`. The other
`ByRoleOptions` (`checked`, `disabled`, `expanded`, `selected`,
`pressed`) are silently dropped. Known v0.1.0 bug — tracked in
`ROADMAP.md`.

Source: packages/testing-ui/src/adapters/rtl.ts:304-320 (`findAllByRole`)

### HIGH Omitting `userEvent`

Wrong:

```ts
const { container } = render(<Form />);
const { actions } = form.from(rtl(container));   // no user
await actions.submit();                          // synthetic clicks
```

Correct:

```ts
const user = userEvent.setup();
const { container } = render(<Form />);
const { actions } = form.from(rtl(container, user));
await actions.submit();
```

Without `userEvent`, `fill()` uses `setNativeValue` and dispatches
`input`/`change` only; many React-Hook-Form, IMask, and custom controlled
components require real key events. Tests pass or fail asymmetrically
between adapters until you add `user`.

Source: packages/testing-ui/src/adapters/rtl.ts:111-124 (`UserEventLike` branches)

### HIGH Asserting on the locator instead of the element

Wrong:

```ts
expect(elements.heading).toHaveTextContent("Hi");   // asserts on a function
```

Correct:

```ts
expect(elements.heading()).toHaveTextContent("Hi");
// equivalent:
expect(elements.heading.get()).toHaveTextContent("Hi");
```

jest-dom matchers expect an `HTMLElement` (or `null`); a bare locator is
a callable Proxy and the matcher silently fails or passes for the wrong
reason.

Source: packages/testing-ui/src/callable.ts; packages/testing-ui/src/types.ts (`Locator`)

### MEDIUM Assuming substring text matching

Wrong:

```ts
l.byText("submitted")
// misses an element rendered as "Form submitted successfully"
```

Correct:

```ts
l.byText(/submitted/i)
```

`byText` / `byLabel` / `byPlaceholder` compare strings with `===`. Only
RegExp produces partial or case-insensitive matches. Agents trained on
default `@testing-library/dom` behavior often assume substring.

Source: packages/testing-ui/src/adapters/rtl.ts:243-247 (`matches()`)

### MEDIUM Importing `rtl` from the package root

Wrong:

```ts
import { rtl } from "testing-widgets";
```

Correct:

```ts
import { rtl } from "testing-widgets/adapters/rtl";
```

`testing-widgets/package.json` defines `rtl` only under the
`./adapters/rtl` subpath export. The root entry exposes `widget`,
`enhance`, `asCallable`, and types — not the adapters.

Source: packages/testing-ui/package.json (`exports`)

### MEDIUM Scoping to `document.body` when a container is available

Wrong:

```ts
render(<Form />);
const { elements } = form.from(rtl());     // scopes to document.body
```

Correct:

```ts
const { container } = render(<Form />);
const { elements } = form.from(rtl(container, user));
```

Default scope is `document.body`. With multiple renders in one test file
or with portals (Storybook, modals), `document.body` matches outside the
component under test. Pass `render`'s container explicitly.

Source: packages/testing-ui/src/adapters/rtl.ts:30-35 (default container)

## See also

- `define-widget/SKILL.md` — authoring the widget definition this skill wires.
- `wire-playwright/SKILL.md` — same widget, async runner; shared selector mental model.
