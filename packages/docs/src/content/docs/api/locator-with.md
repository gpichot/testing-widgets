---
title: LocatorWith
description: API reference for the LocatorWith enhanced locator interface.
---

`LocatorWith` extends `Locator` with short aliases and role shortcut methods. It is the type you receive inside a `widget()` factory.

## Import

```ts
import type { LocatorWith } from "testing-ui";
```

## Short Aliases

These are shorter versions of the `getBy*` methods:

| Alias | Equivalent |
| ----- | ---------- |
| `byRole(role, options?)` | `getByRole(role, options?)` |
| `byLabel(text)` | `getByLabel(text)` |
| `byPlaceholder(text)` | `getByPlaceholder(text)` |
| `byText(text)` | `getByText(text)` |
| `byTestId(testId)` | `getByTestId(testId)` |

```ts
// These are equivalent:
l.getByLabel("Email");
l.byLabel("Email");
```

## Role Shortcuts

Convenience methods that call `getByRole()` with a predefined role. Each returns a `LocatorWith` for further chaining.

| Method | Role | Options |
| ------ | ---- | ------- |
| `button(options?)` | `"button"` | `{ name? }` |
| `link(options?)` | `"link"` | `{ name? }` |
| `textbox(options?)` | `"textbox"` | `{ name? }` |
| `checkbox(options?)` | `"checkbox"` | `{ name?, checked? }` |
| `radio(options?)` | `"radio"` | `{ name?, checked? }` |
| `combobox(options?)` | `"combobox"` | `{ name? }` |
| `heading(options?)` | `"heading"` | `{ name? }` |
| `dialog(options?)` | `"dialog"` | `{ name? }` |
| `list(options?)` | `"list"` | `{ name? }` |
| `listitem(options?)` | `"listitem"` | `{ name? }` |
| `img(options?)` | `"img"` | `{ name? }` |
| `tab(options?)` | `"tab"` | `{ name?, selected? }` |
| `tabpanel(options?)` | `"tabpanel"` | `{ name? }` |
| `navigation(options?)` | `"navigation"` | `{ name? }` |
| `region(options?)` | `"region"` | `{ name? }` |

### Examples

```ts
const myWidget = widget((l) => ({
  // Role shortcuts — concise and readable
  title: l.heading({ name: "Dashboard" }),
  loginBtn: l.button({ name: "Log in" }),
  emailInput: l.textbox({ name: "Email" }),
  rememberMe: l.checkbox({ name: "Remember me" }),
  navBar: l.navigation(),
  profileLink: l.link({ name: "Profile" }),
  settingsTab: l.tab({ name: "Settings", selected: true }),

  // Short aliases
  searchInput: l.byLabel("Search"),
  errorText: l.byText("Something went wrong"),
  hero: l.byTestId("hero-section"),
}));
```

## Chaining

All methods on `LocatorWith` return a `LocatorWith`, so shortcuts are preserved through the chain:

```ts
const widget = widget((l) => ({
  // Find a button inside a dialog — shortcuts work at every level
  confirmBtn: l.dialog({ name: "Confirm" }).button({ name: "OK" }),
}));
```
