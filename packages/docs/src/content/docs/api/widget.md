---
title: widget()
description: API reference for the widget() factory function.
---

The `widget()` function is the main entry point for defining reusable, runner-agnostic test widgets.

## Import

```ts
import { widget } from "testing-ui";
```

## Signature

```ts
function widget<T>(factory: (locator: LocatorWith) => T): WidgetDef<T>;
```

### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `factory` | `(locator: LocatorWith) => T` | A function that receives an enhanced locator and returns your widget shape |

### Returns

A `WidgetDef<T>` object with a single method:

```ts
interface WidgetDef<T> {
  from(locator: Locator): T;
}
```

## Usage

### Basic widget

```ts
const myWidget = widget((l) => ({
  heading: l.heading({ name: "Welcome" }),
  submitButton: l.button({ name: "Submit" }),
}));

// Connect to a test runner
const { heading, submitButton } = myWidget.from(rtl(container));
```

### With elements and actions

```ts
const loginForm = widget((l) => ({
  elements: {
    email: l.byLabel("Email"),
    password: l.byLabel("Password"),
    submit: l.button({ name: "Sign in" }),
  },
  actions: {
    login: async (email: string, password: string) => {
      await l.byLabel("Email").fill(email);
      await l.byLabel("Password").fill(password);
      await l.button({ name: "Sign in" }).click();
    },
  },
}));
```

### With parameterized elements

Elements can be functions that accept parameters:

```ts
const userList = widget((l) => ({
  elements: {
    userRow: (name: string) => l.byRole("row", { name }),
    deleteButton: (name: string) =>
      l.byRole("row", { name }).getByRole("button", { name: "Delete" }),
  },
}));
```

## How It Works

Internally, `widget()` calls `enhance()` on the provided locator to add shortcut methods, then passes it to your factory function:

```ts
function widget<T>(factory: (locator: LocatorWith) => T) {
  return {
    from(locator: Locator): T {
      return factory(enhance(locator));
    },
  };
}
```

## Type: WidgetDef

```ts
type WidgetDef<T> = ReturnType<typeof widget<T>>;
```

Use this type when you need to pass widget definitions around:

```ts
function setupWidget<T>(def: WidgetDef<T>, container: HTMLElement): T {
  return def.from(rtl(container));
}
```
