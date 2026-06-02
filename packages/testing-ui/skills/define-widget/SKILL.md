---
name: define-widget
description: >
  Define a Widget Object Model for a UI feature using widget((l) => ...).
  Load this skill when authoring or refactoring a widget definition,
  picking selectors (l.button, l.heading, l.byLabel, l.byText, l.byRole,
  l.byTestId), modeling parameterized elements (functions returning
  locators), composing nested widgets with inner.from(l), or designing
  async actions. The factory receives a LocatorWith with role shortcuts
  and short aliases; the same definition runs under both the RTL and
  Playwright adapters via .from(adapter).
type: core
library: testing-widgets
library_version: "0.1.0"
sources:
  - "gpichot/testing-widgets:packages/testing-ui/src/widget.ts"
  - "gpichot/testing-widgets:packages/testing-ui/src/enhanced.ts"
  - "gpichot/testing-widgets:packages/testing-ui/src/callable.ts"
  - "gpichot/testing-widgets:packages/testing-ui/src/types.ts"
  - "gpichot/testing-widgets:packages/testing-ui/src/__tests__/widget.test.ts"
  - "gpichot/testing-widgets:packages/docs/src/content/docs/api/widget.md"
  - "gpichot/testing-widgets:packages/docs/src/content/docs/api/locator-with.md"
  - "gpichot/testing-widgets:packages/example-react/src/ContactForm.widgets.ts"
---

# testing-widgets — Define a widget

A `widget()` definition pairs **elements** (lazy locators) with **actions**
(async operations). The factory receives a `LocatorWith` and returns any
shape. The same definition is later connected to a runner with
`.from(rtl(...))` or `.from(playwright(...))`.

## Setup

```ts
// src/ContactForm.widgets.ts
import { widget } from "testing-widgets";

export const contactForm = widget((l) => ({
  elements: {
    heading: l.heading({ name: "Contact us" }),
    nameInput: l.byLabel("Name"),
    messageInput: l.byLabel("Message"),
    submitButton: l.button({ name: "Send" }),
    thankYou: (name: string) => l.heading({ name: `Thank you, ${name}!` }),
    confirmation: l.byText("Your message has been sent."),
  },
  actions: {
    fillName: (name: string) => l.byLabel("Name").fill(name),
    submit: () => l.button({ name: "Send" }).click(),
    submitForm: async (name: string, message: string) => {
      await l.byLabel("Name").fill(name);
      await l.byLabel("Message").fill(message);
      await l.button({ name: "Send" }).click();
    },
  },
}));
```

## Core Patterns

### Selector priority — role > label > text > placeholder > testId

Always pick the highest tier that still uniquely identifies the element.
The `LocatorWith` API exposes both role shortcuts and short aliases:

```ts
// Role shortcuts (preferred for accessible elements)
l.button({ name: "Send" })
l.heading({ name: "Welcome" })
l.textbox({ name: "Email" })
l.checkbox({ name: "Accept terms" })
l.link({ name: "Home" })
l.combobox({ name: "Country" })
l.dialog({ name: "Confirm" })
l.list(); l.listitem({ name: "Item 1" })
l.img({ name: "Logo" })
l.tab({ name: "Settings" }); l.tabpanel({ name: "Settings" })
l.navigation(); l.region({ name: "Sidebar" })

// Short aliases (use when role doesn't apply)
l.byLabel("Email")            // form field by associated <label>
l.byText("Welcome back")      // visible text node (string is EXACT)
l.byPlaceholder("Search...")  // input placeholder
l.byRole("status")            // any ARIA role not covered above
l.byTestId("checkout-cta")    // LAST resort
```

### Parameterized elements

When the element depends on runtime data, return a function from the
factory. Bare locators are fine for static elements — only wrap in a
thunk when you need a parameter.

```ts
export const userList = widget((l) => ({
  elements: {
    list: l.list({ name: "Users" }),                             // static
    row: (name: string) => l.byRole("row", { name }),            // parameterized
    deleteBtn: (name: string) =>
      l.byRole("row", { name }).getByRole("button", { name: "Delete" }),
  },
  actions: {
    delete: (name: string) =>
      l.byRole("row", { name }).getByRole("button", { name: "Delete" }).click(),
  },
}));
```

### Composing widgets

Nest widgets by calling `inner.from(l)` with the *same* locator. Each
inner widget queries within its own selectors; no scoping container is
required for the composition itself.

```ts
const header = widget((l) => ({
  elements: { title: l.heading({ name: "My App" }) },
}));

const form = widget((l) => ({
  elements: { submit: l.button({ name: "Submit" }) },
}));

export const appPage = widget((l) => ({
  widgets: {
    header: header.from(l),
    form: form.from(l),
  },
}));

// usage
const { widgets } = appPage.from(rtl(container, user));
widgets.header.elements.title();
widgets.form.elements.submit();
```

### Async actions

Every action that touches the DOM returns a Promise. Compose them with
`async/await`; do not drop awaits.

```ts
actions: {
  submit: async () => {
    await l.byLabel("Name").fill("Alice");
    await l.byLabel("Message").fill("Hello");
    await l.button({ name: "Send" }).click();
  },
}
```

### Chaining and scoping

Role shortcuts return `LocatorWith`, so they chain naturally for scoped
queries:

```ts
l.dialog({ name: "Confirm" }).button({ name: "OK" })
l.byRole("row", { name: "Alice" }).getByRole("button", { name: "Edit" })
```

## Common Mistakes

### CRITICAL Bypassing the widget in test code

Wrong:

```ts
// in a vitest or playwright test
import { screen } from "@testing-library/react";
screen.getByRole("button", { name: "Send" }).click();
// or
await page.getByRole("button", { name: "Send" }).click();
```

Correct:

```ts
const { elements, actions } = contactForm.from(rtl(container, user));
await actions.submit();
// or for one-off interaction:
await elements.submitButton.click();
```

The widget abstraction exists so selectors live in one place. Direct
`screen.*` or `page.*` queries inside tests defeat reusability and split
the source of truth.

Source: maintainer-defined antipattern (covers all three skills)

### HIGH Using testId when role or label would work

Wrong:

```ts
elements: {
  submitButton: l.byTestId("submit-btn"),
  nameInput: l.byTestId("name-input"),
}
```

Correct:

```ts
elements: {
  submitButton: l.button({ name: "Send" }),
  nameInput: l.byLabel("Name"),
}
```

`byTestId` is a last resort — it disconnects tests from the accessibility
tree. The library's RTL adapter maps roles to selectors at
`packages/testing-ui/src/adapters/rtl.ts:290-302`; prefer role+name, fall
back to label for form fields, only use testId for opaque containers
with no semantic anchor.

Source: packages/testing-ui/src/adapters/rtl.ts (implicitRoles)

### HIGH Resolving elements at definition time

Wrong:

```ts
export const form = widget((l) => ({
  elements: { heading: l.heading({ name: "Hi" }).get() }, // resolves once
}));
```

Correct:

```ts
export const form = widget((l) => ({
  elements: { heading: l.heading({ name: "Hi" }) },        // stays lazy
}));
```

Calling `.get()` inside the factory captures whatever the DOM looks like
at `.from()` time — including potentially nothing. Locators are designed
to re-resolve on every access, so the same definition reads correctly
before and after `actions.submit()` mutates the DOM.

Source: packages/testing-ui/src/widget.ts; packages/testing-ui/src/adapters/rtl.ts (`lazy()`)

### HIGH Non-async multi-step actions

Wrong:

```ts
actions: {
  submit: () => {
    l.byLabel("Name").fill("Alice");
    l.button({ name: "Send" }).click();
  },
}
```

Correct:

```ts
actions: {
  submit: async () => {
    await l.byLabel("Name").fill("Alice");
    await l.button({ name: "Send" }).click();
  },
}
```

`fill` and `click` return `Promise<void>`. Without `await`, both promises
start in parallel and the test continues before either has settled —
races and ordering bugs follow.

Source: packages/testing-ui/src/types.ts (action signatures)

### MEDIUM Wrapping a static locator in a thunk

Wrong:

```ts
elements: {
  heading: () => l.heading({ name: "Welcome" }),
}
// call site requires double invocation: elements.heading()()
```

Correct:

```ts
elements: {
  heading: l.heading({ name: "Welcome" }),         // bare — already callable
  // function form is for parameterized elements only:
  row: (name: string) => l.byRole("row", { name }),
}
```

Locators are themselves callable (`locator()` is shorthand for
`locator.get()`). Wrapping a static locator in an arrow function forces
callers to double-invoke and tends to break type inference.

Source: packages/example-react/src/ContactForm.widgets.ts (mix of bare + parameterized)

### MEDIUM Re-declaring selectors instead of composing

Wrong:

```ts
export const appPage = widget((l) => ({
  elements: {
    // duplicates selectors that already live in `header` / `form` widgets
    headerTitle: l.heading({ name: "My App" }),
    formSubmit: l.button({ name: "Submit" }),
  },
}));
```

Correct:

```ts
export const appPage = widget((l) => ({
  widgets: {
    header: header.from(l),
    form: form.from(l),
  },
}));
```

Composition keeps each widget the single source of truth for its
selectors. When a label changes, you update one place.

Source: packages/testing-ui/src/__tests__/widget.test.ts (`supports composing widgets`)

### HIGH Tension: accessibility-first selectors vs the testId reflex

Agents often default to `byTestId` because it feels stable. The library
is explicitly designed around the accessibility tree (role > label >
text > placeholder > testId). Optimizing for "won't break on refactor"
by reaching for testId everywhere quietly disconnects the test suite
from user-facing semantics — the very thing the Widget Object Model is
meant to capture.

See also: `wire-rtl/SKILL.md` § Common Mistakes, `wire-playwright/SKILL.md` § Common Mistakes.

### HIGH Tension: sync RTL vs lazy Playwright semantics

The same widget must work in RTL (where `elements.heading()` returns an
`HTMLElement` synchronously) and Playwright (where it returns a lazy
`Locator`). Test code that assumes one return shape breaks under the
other adapter. Keep actions async and avoid storing the result of
`elements.foo()` for later inspection — re-call it where you need the
current value.

See also: `wire-rtl/SKILL.md` § Common Mistakes, `wire-playwright/SKILL.md` § Common Mistakes.

## See also

- `wire-rtl/SKILL.md` — how `.from(rtl(...))` consumes a widget under vitest + RTL
- `wire-playwright/SKILL.md` — how `.from(playwright(...))` consumes a widget under Playwright
