---
title: Locators
description: Understanding the Locator system in testing-ui.
---

Locators are the core abstraction in testing-ui. They represent a way to find and interact with UI elements without being tied to a specific testing framework.

## The Locator Interface

A `Locator` is a callable object that provides methods for querying, resolving, and interacting with UI elements:

```ts
interface Locator {
  // Calling directly is shorthand for .get()
  (): unknown;

  // Queries — return new Locators (chainable)
  getByRole(role: string, options?: ByRoleOptions): Locator;
  getByLabel(text: string | RegExp): Locator;
  getByPlaceholder(text: string | RegExp): Locator;
  getByText(text: string | RegExp): Locator;
  getByTestId(testId: string): Locator;

  // Resolution — access the underlying element
  get(): unknown;
  getAll(): unknown[];
  query(): unknown | null;
  queryAll(): unknown[];
  find(): Promise<unknown>;

  // Actions
  click(): Promise<void>;
  fill(value: string): Promise<void>;
  check(): Promise<void>;
  uncheck(): Promise<void>;
  selectOption(value: string | string[]): Promise<void>;
  clear(): Promise<void>;

  // State queries
  textContent(): Promise<string | null>;
  getAttribute(name: string): Promise<string | null>;
  inputValue(): Promise<string>;
  isVisible(): Promise<boolean>;
  isEnabled(): Promise<boolean>;
  isChecked(): Promise<boolean>;
}
```

## Lazy Evaluation

Locator queries are **lazy** — they don't resolve immediately. Instead, they build up a query chain that is only evaluated when you access the element:

```ts
const heading = locator.getByRole("heading"); // No DOM query yet
heading.get();  // NOW the query runs
heading();      // Same as .get()
```

This means you can safely define locators before the component is rendered.

## Callable Syntax

Every `Locator` is callable. Calling it directly is shorthand for `.get()`:

```ts
const button = locator.getByRole("button", { name: "Submit" });

// These are equivalent:
button();      // callable shorthand
button.get();  // explicit method
```

## Resolution Methods

| Method      | Returns               | Throws if not found? |
| ----------- | --------------------- | -------------------- |
| `get()`     | Element               | Yes                  |
| `getAll()`  | Element[]             | Yes (if none)        |
| `query()`   | Element \| null       | No                   |
| `queryAll()`| Element[]             | No (empty array)     |
| `find()`    | Promise\<Element\>    | Yes (async, waits)   |

## Chaining

Locators support chaining for scoped queries:

```ts
// Find a button inside a specific dialog
const dialog = locator.getByRole("dialog", { name: "Confirm" });
const confirmBtn = dialog.getByRole("button", { name: "OK" });
```

## ByRoleOptions

When using `getByRole()`, you can pass options to narrow the match:

```ts
interface ByRoleOptions {
  name?: string | RegExp;     // Accessible name
  checked?: boolean;          // Checkbox/radio state
  disabled?: boolean;         // Disabled state
  expanded?: boolean;         // Expanded state (e.g., accordion)
  selected?: boolean;         // Selected state (e.g., tab)
  pressed?: boolean;          // Pressed state (e.g., toggle button)
}
```

Example:

```ts
locator.getByRole("checkbox", { name: "Accept terms", checked: false });
locator.getByRole("tab", { name: "Settings", selected: true });
```
