---
title: Locator
description: API reference for the Locator interface.
---

The core type in testing-widgets. A `Locator` is callable — `locator()` is shorthand for `locator.get()`. All queries are lazy and chainable.

```ts
import type { Locator, ByRoleOptions } from "testing-widgets";
```

## Queries

Return a new scoped `Locator`. Support `string` or `RegExp` where noted.

```ts
locator.getByRole("button", { name: "Submit" })
locator.getByLabel("Email")          // string | RegExp
locator.getByPlaceholder("Search")   // string | RegExp
locator.getByText("Welcome")         // string | RegExp
locator.getByTestId("hero")
```

**ByRoleOptions:** `name`, `checked`, `disabled`, `expanded`, `selected`, `pressed` — all optional.

## Resolution

| Method | Returns | Throws? |
| ------ | ------- | ------- |
| `get()` | element | yes (none or several, RTL) |
| `getAll()` | element[] | yes (if none) |
| `query()` | element \| null | only if several match (RTL) |
| `queryAll()` | element[] | no |
| `find(options?)` | Promise\<element\> | rejects if none or more than one match after the timeout |
| `findAll(options?)` | Promise\<element[]\> | rejects if none match after the timeout |
| `()` | element | yes (same as `get()`) |

`find()` / `findAll()` mirror RTL's `findBy*` / `findAllBy*`. `options` is `{ timeout?: number; interval?: number }` (defaults: 1000ms / 50ms). In the Playwright adapter, `find()` returns the (lazy, auto-waiting) locator and `findAll()` returns `locator.all()`.

## Actions

All return `Promise<void>`.

| Method | Description |
| ------ | ----------- |
| `click()` | Click the element |
| `fill(value)` | Fill input/textarea |
| `check()` | Check checkbox/radio (idempotent) |
| `uncheck()` | Uncheck checkbox/radio (idempotent) |
| `selectOption(value)` | Select option(s) — accepts `string \| string[]` |
| `clear()` | Clear an input |

## State

All return promises.

| Method | Returns |
| ------ | ------- |
| `textContent()` | `string \| null` |
| `getAttribute(name)` | `string \| null` |
| `inputValue()` | `string` |
| `isVisible()` | `boolean` |
| `isEnabled()` | `boolean` |
| `isChecked()` | `boolean` |

## Chaining

Queries scope within the parent, so you can drill into nested elements:

```ts
const dialog = locator.getByRole("dialog", { name: "Confirm" });
const okBtn = dialog.getByRole("button", { name: "OK" });
```
