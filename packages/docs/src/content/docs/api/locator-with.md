---
title: LocatorWith
description: Enhanced locator with role shortcuts and short aliases.
---

`LocatorWith` extends [`Locator`](/api/locator/) with convenience methods. This is the type you get inside a `widget()` factory.

```ts
import type { LocatorWith } from "testing-widgets";
```

## Short Aliases

Drop the `getBy` prefix:

| Alias | Equivalent |
| ----- | ---------- |
| `byRole(role, opts?)` | `getByRole(role, opts?)` |
| `byLabel(text)` | `getByLabel(text)` |
| `byPlaceholder(text)` | `getByPlaceholder(text)` |
| `byText(text)` | `getByText(text)` |
| `byTestId(id)` | `getByTestId(id)` |

## Role Shortcuts

Call `getByRole()` with a preset role. All return `LocatorWith` for chaining.

| Method | Role | Extra options |
| ------ | ---- | ------------- |
| `button()` | button | `name` |
| `link()` | link | `name` |
| `textbox()` | textbox | `name` |
| `checkbox()` | checkbox | `name`, `checked` |
| `radio()` | radio | `name`, `checked` |
| `combobox()` | combobox | `name` |
| `heading()` | heading | `name` |
| `dialog()` | dialog | `name` |
| `list()` | list | `name` |
| `listitem()` | listitem | `name` |
| `img()` | img | `name` |
| `tab()` | tab | `name`, `selected` |
| `tabpanel()` | tabpanel | `name` |
| `navigation()` | navigation | `name` |
| `region()` | region | `name` |

Shortcuts chain naturally:

```ts
l.dialog({ name: "Confirm" }).button({ name: "OK" })
```
