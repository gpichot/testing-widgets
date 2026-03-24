---
title: React Testing Library Adapter
description: Using testing-ui with React Testing Library and Vitest.
---

The RTL adapter connects testing-ui to [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/).

## Import

```ts
import { rtl } from "testing-ui/adapters/rtl";
```

## Signature

```ts
function rtl(container?: HTMLElement, user?: UserEventLike): Locator;
```

### Parameters

| Parameter | Type | Default | Description |
| --------- | ---- | ------- | ----------- |
| `container` | `HTMLElement` | `document.body` | The root element to query within |
| `user` | `UserEventLike` | `undefined` | Optional `userEvent` instance for realistic interactions |

### Returns

A `Locator` bound to the container.

## Basic Usage

```ts
import { render } from "@testing-library/react";
import { rtl } from "testing-ui/adapters/rtl";

const { container } = render(<MyComponent />);
const locator = rtl(container);
```

## With userEvent

For realistic user interactions (recommended), pass a `userEvent` instance:

```ts
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rtl } from "testing-ui/adapters/rtl";

const user = userEvent.setup();
const { container } = render(<MyComponent />);
const locator = rtl(container, user);
```

When `user` is provided:
- `click()` uses `user.click()` instead of `el.click()`
- `fill()` uses `user.clear()` + `user.type()` instead of setting the value directly
- `selectOption()` uses `user.selectOptions()`
- `clear()` uses `user.clear()`

Without `user`, the adapter falls back to native DOM methods and events.

## Query Engine

The RTL adapter implements its own minimal DOM query engine. It does **not** depend on `@testing-library/dom` at runtime.

### Supported implicit roles

The adapter maps common HTML elements to their implicit ARIA roles:

| Role | Matched Elements |
| ---- | ---------------- |
| `button` | `<button>`, `[role="button"]`, `input[type="button"]`, `input[type="submit"]` |
| `textbox` | `<input>` (no type or `type="text"`), `<textarea>`, `[role="textbox"]` |
| `checkbox` | `input[type="checkbox"]`, `[role="checkbox"]` |
| `radio` | `input[type="radio"]`, `[role="radio"]` |
| `link` | `<a href>`, `[role="link"]` |
| `heading` | `<h1>`–`<h6>`, `[role="heading"]` |
| `list` | `<ul>`, `<ol>`, `[role="list"]` |
| `listitem` | `<li>`, `[role="listitem"]` |
| `combobox` | `<select>`, `[role="combobox"]` |
| `dialog` | `<dialog>`, `[role="dialog"]` |
| `img` | `<img alt>`, `[role="img"]` |

For any role not in this list, the adapter falls back to `[role="<role>"]` selector.

### Name matching

When `options.name` is provided to `getByRole()`, the adapter checks:
1. The element's `aria-label` attribute
2. The element's trimmed text content

Both `string` and `RegExp` values are supported.

## Complete Example

```ts
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rtl } from "testing-ui/adapters/rtl";
import { widget } from "testing-ui";

const myForm = widget((l) => ({
  nameInput: l.byLabel("Name"),
  submit: l.button({ name: "Save" }),
  save: async (name: string) => {
    await l.byLabel("Name").fill(name);
    await l.button({ name: "Save" }).click();
  },
}));

it("saves the form", async () => {
  const user = userEvent.setup();
  const { container } = render(<MyForm />);
  const { nameInput, save } = myForm.from(rtl(container, user));

  await save("Alice");
  expect(nameInput()).toHaveValue("Alice");
});
```
