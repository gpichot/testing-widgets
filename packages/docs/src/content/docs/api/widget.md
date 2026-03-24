---
title: widget()
description: API reference for the widget() factory function.
---

Creates a reusable, runner-agnostic widget definition.

```ts
import { widget } from "testing-ui";
```

## Signature

```ts
function widget<T>(factory: (locator: LocatorWith) => T): { from(locator: Locator): T }
```

The factory receives a [`LocatorWith`](/api/locator-with/) (a locator with role shortcuts) and returns whatever shape you want. Call `.from(adapter)` to connect it to a test runner.

## Usage

```ts
const myForm = widget((l) => ({
  nameInput: l.byLabel("Name"),
  submit: l.button({ name: "Save" }),
  save: async (name: string) => {
    await l.byLabel("Name").fill(name);
    await l.button({ name: "Save" }).click();
  },
}));

// Connect to an adapter
const { nameInput, submit, save } = myForm.from(rtl(container, user));
const { nameInput, submit, save } = myForm.from(playwright(page));
```

Elements can be parameterized:

```ts
const userList = widget((l) => ({
  row: (name: string) => l.byRole("row", { name }),
  deleteBtn: (name: string) =>
    l.byRole("row", { name }).getByRole("button", { name: "Delete" }),
}));
```

## WidgetDef type

```ts
type WidgetDef<T> = ReturnType<typeof widget<T>>;
```

## Helper utilities

`widget()` internally uses two lower-level functions that are also exported:

- **`enhance(base: Locator): LocatorWith`** — wraps a base locator with role shortcuts and short aliases. Called automatically by `widget()`.
- **`asCallable(impl: LocatorMethods): Locator`** — makes a `LocatorMethods` implementation callable (calling it invokes `.get()`). Used by adapter authors.
