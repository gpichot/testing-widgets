---
title: Locator
description: API reference for the Locator interface.
---

The `Locator` interface is the core type in testing-ui. It extends `LocatorMethods` and is callable — calling it directly is shorthand for `.get()`.

## Import

```ts
import type { Locator, LocatorMethods, ByRoleOptions } from "testing-ui";
```

## Query Methods

These methods return a new `Locator` scoped to the matched element. They are chainable and lazily evaluated.

### getByRole(role, options?)

Find an element by its ARIA role.

```ts
locator.getByRole("button", { name: "Submit" });
locator.getByRole("heading");
locator.getByRole("checkbox", { checked: true });
```

**Options (`ByRoleOptions`):**

| Option | Type | Description |
| ------ | ---- | ----------- |
| `name` | `string \| RegExp` | Accessible name (aria-label or text content) |
| `checked` | `boolean` | Checked state |
| `disabled` | `boolean` | Disabled state |
| `expanded` | `boolean` | Expanded state |
| `selected` | `boolean` | Selected state |
| `pressed` | `boolean` | Pressed state |

### getByLabel(text)

Find an element by its associated label text.

```ts
locator.getByLabel("Email");
locator.getByLabel(/email/i);
```

### getByPlaceholder(text)

Find an element by its placeholder attribute.

```ts
locator.getByPlaceholder("Enter your email");
```

### getByText(text)

Find an element by its text content.

```ts
locator.getByText("Welcome back");
locator.getByText(/welcome/i);
```

### getByTestId(testId)

Find an element by its `data-testid` attribute.

```ts
locator.getByTestId("submit-form");
```

## Resolution Methods

### get()

Resolve to the native element. Throws if not found.

```ts
const element = locator.getByRole("button").get();
```

### getAll()

Resolve all matching elements. Throws if none found.

```ts
const buttons = locator.getByRole("button").getAll();
```

### query()

Resolve to the native element, or `null` if not found. Does not throw.

```ts
const element = locator.getByRole("alert").query();
if (element) {
  // element exists
}
```

### queryAll()

Resolve all matching elements. Returns empty array if none found.

```ts
const items = locator.getByRole("listitem").queryAll();
```

### find()

Async resolution — waits for the element to appear.

```ts
const element = await locator.getByRole("dialog").find();
```

## Action Methods

All action methods are async and return `Promise<void>`.

### click()

Click the element.

```ts
await locator.getByRole("button", { name: "Submit" }).click();
```

### fill(value)

Fill a text input or textarea with the given value.

```ts
await locator.getByLabel("Email").fill("alice@example.com");
```

### check()

Check a checkbox or radio button. Idempotent — does nothing if already checked.

```ts
await locator.getByRole("checkbox", { name: "Accept" }).check();
```

### uncheck()

Uncheck a checkbox or radio button. Idempotent — does nothing if already unchecked.

```ts
await locator.getByRole("checkbox", { name: "Accept" }).uncheck();
```

### selectOption(value)

Select one or more options in a `<select>` element.

```ts
await locator.getByRole("combobox").selectOption("option-1");
await locator.getByRole("combobox").selectOption(["a", "b"]);
```

### clear()

Clear an input field.

```ts
await locator.getByLabel("Search").clear();
```

## State Methods

All state methods are async.

### textContent()

Get the element's text content.

```ts
const text = await locator.getByRole("heading").textContent();
```

### getAttribute(name)

Get an attribute value.

```ts
const href = await locator.getByRole("link").getAttribute("href");
```

### inputValue()

Get the current value of an input field.

```ts
const value = await locator.getByLabel("Email").inputValue();
```

### isVisible()

Check if the element is visible.

```ts
const visible = await locator.getByRole("dialog").isVisible();
```

### isEnabled()

Check if the element is enabled (not disabled).

```ts
const enabled = await locator.getByRole("button").isEnabled();
```

### isChecked()

Check if a checkbox or radio is checked.

```ts
const checked = await locator.getByRole("checkbox").isChecked();
```
