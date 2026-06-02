---
name: wire-playwright
description: >
  Adopt a testing-widgets widget definition inside a Playwright e2e
  suite. Load this skill when wiring an existing widget via
  playwright(page) (or a Playwright Locator), using async assertions
  through @playwright/test expect(), working with lazy Locator
  resolution semantics where get()/query()/find() all return the
  Playwright locator synchronously, replacing getAll()/queryAll()
  (which throw) with await locator.get().all(), or importing from
  testing-widgets/adapters/playwright. Covers the v0.1.0 caveat that
  ByRoleOptions other than `name` are silently dropped.
type: framework
library: testing-widgets
framework: playwright
library_version: "0.1.0"
requires:
  - define-widget
sources:
  - "gpichot/testing-widgets:packages/testing-ui/src/adapters/playwright.ts"
  - "gpichot/testing-widgets:packages/docs/src/content/docs/adapters/playwright.md"
  - "gpichot/testing-widgets:packages/example-react/e2e/contact-form.spec.ts"
  - "gpichot/testing-widgets:packages/example-react/playwright.config.ts"
  - "gpichot/testing-widgets:packages/testing-ui/package.json"
---

This skill builds on `define-widget`. Read that first for how to author
the widget being wired here.

# testing-widgets — Wire Playwright

The `playwright` adapter accepts a Playwright `Page`, `Locator`, or
anything matching the `PwLocatable` structural interface. There is no
compile-time dependency on `@playwright/test` — the adapter relies on
duck-typing.

## Setup

```ts
// e2e/contact-form.spec.ts
import { expect, test } from "@playwright/test";
import { playwright } from "testing-widgets/adapters/playwright";
import { contactForm } from "../src/ContactForm.widgets.js";

test.describe("ContactForm", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("submits and shows confirmation", async ({ page }) => {
    const { elements, actions } = contactForm.from(playwright(page));

    await actions.submitForm("Alice", "Hello!");

    await expect(elements.thankYou("Alice").get()).toHaveText("Thank you, Alice!");
    await expect(elements.confirmation.get()).toHaveText("Your message has been sent.");
  });
});
```

## Core Patterns

### Always `await page.goto(...)` before constructing the adapter

```ts
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
```

`playwright(page)` does not navigate; widgets resolve against whatever
page state exists when assertions run. Putting `goto` in `beforeEach`
keeps every test starting from a known route.

### Async assertions via `expect(elements.x.get())`

Playwright's `expect` is async and operates on the underlying locator.
Pass `elements.x.get()` (or the callable shorthand `elements.x()`) — both
return the Playwright `Locator` synchronously.

```ts
await expect(elements.heading.get()).toHaveText("Contact us");
await expect(elements.submitButton.get()).toBeEnabled();
await expect(elements.acceptBox.get()).toBeChecked();
```

### Iterate matching elements via `.get().all()`

The synchronous `getAll()` / `queryAll()` methods on the widget locator
throw under Playwright. Reach into the underlying Playwright locator and
call its async `all()`:

```ts
const rowLocs = await elements.list.getByRole("row").get().all();
for (const row of rowLocs) {
  await expect(row).toBeVisible();
}
// or:
await expect(elements.list.getByRole("row").get()).toHaveCount(3);
```

### Adapter accepts Page or Locator

You can scope the widget to a sub-tree by passing a Playwright Locator
instead of a Page:

```ts
const dialog = page.getByRole("dialog", { name: "Confirm" });
const { actions } = confirmDialog.from(playwright(dialog));
await actions.confirm();
```

### Subpath import

```ts
import { playwright } from "testing-widgets/adapters/playwright";   // ✅
```

The adapter is only exposed under the `testing-widgets/adapters/playwright`
subpath.

## Common Mistakes

### CRITICAL Bypassing the widget in test code

Wrong:

```ts
test("send", async ({ page }) => {
  await page.goto("/");
  await page.getByLabel("Name").fill("Alice");
  await page.getByRole("button", { name: "Send" }).click();
  await expect(page.getByText("Your message has been sent.")).toBeVisible();
});
```

Correct:

```ts
test("send", async ({ page }) => {
  await page.goto("/");
  const { elements, actions } = contactForm.from(playwright(page));
  await actions.submitForm("Alice", "Hello!");
  await expect(elements.confirmation.get()).toBeVisible();
});
```

`page.getBy*` / `page.locator` inside the test body re-introduces the
selector duplication the widget exists to remove. If a label or button
text changes, you should be editing the widget definition only.

Source: maintainer-defined antipattern; packages/example-react/e2e/contact-form.spec.ts (canonical pattern)

### CRITICAL `ByRoleOptions` other than `name` are silently dropped

Wrong:

```ts
elements: {
  // Type accepts `checked`, but the Playwright adapter forwards only
  // `name`. At runtime this matches every checkbox named "Accept".
  accepted: l.checkbox({ name: "Accept", checked: true }),
}
```

Correct:

```ts
elements: {
  acceptBox: l.checkbox({ name: "Accept" }),
}
// assert state instead:
await expect(elements.acceptBox.get()).toBeChecked();
```

`PwAdapter.getByRole` forwards only `{ name: options.name }`. The other
`ByRoleOptions` (`checked`, `disabled`, `expanded`, `selected`,
`pressed`) are silently ignored. Known v0.1.0 bug — tracked in
`ROADMAP.md`.

Source: packages/testing-ui/src/adapters/playwright.ts:69-78 (`getByRole`)

### HIGH Calling `getAll()` or `queryAll()` on a Playwright locator

Wrong:

```ts
const items = elements.itemList.getAll();
// throws: "Playwright getAll() is async — use find() or await locator.get().all() instead"
```

Correct:

```ts
const items = await elements.itemList.get().all();
// or, for assertions, use a count matcher:
await expect(elements.itemList.get()).toHaveCount(3);
```

The synchronous methods throw because Playwright resolution is inherently
async. The thrown messages point at the correct pattern.

Source: packages/testing-ui/src/adapters/playwright.ts:104-119

### MEDIUM Awaiting the callable shorthand

Wrong:

```ts
const heading = await elements.heading();   // nothing async happens here
```

Correct:

```ts
await expect(elements.heading()).toHaveText("Hi");   // await the assertion
// or, for an action:
await actions.submit();
```

`elements.heading()` returns the underlying Playwright `Locator`
synchronously. The async work happens in the assertion or action call —
not in resolving the locator.

Source: packages/testing-ui/src/adapters/playwright.ts:100-123 (sync `get`/`query`/`find`)

### MEDIUM Importing `playwright` from the package root

Wrong:

```ts
import { playwright } from "testing-widgets";
```

Correct:

```ts
import { playwright } from "testing-widgets/adapters/playwright";
```

The adapter is only available at the `testing-widgets/adapters/playwright`
subpath. The root entry exposes only `widget`, `enhance`, `asCallable`,
and types.

Source: packages/testing-ui/package.json (`exports`)

## See also

- `define-widget/SKILL.md` — authoring the widget definition this skill wires.
- `wire-rtl/SKILL.md` — same widget, sync runner; shared selector mental model.
