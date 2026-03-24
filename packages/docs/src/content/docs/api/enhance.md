---
title: enhance()
description: API reference for the enhance() function.
---

The `enhance()` function wraps a base `Locator` with shortcut methods, returning a `LocatorWith` that includes role shortcuts and short aliases.

## Import

```ts
import { enhance } from "testing-ui";
```

## Signature

```ts
function enhance(base: Locator): LocatorWith;
```

### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `base` | `Locator` | A base locator from any adapter |

### Returns

A `LocatorWith` — an enhanced locator with additional shortcut methods.

## Usage

You typically don't need to call `enhance()` directly — `widget()` calls it automatically. However, it's useful if you want the shortcuts without the widget pattern:

```ts
import { enhance } from "testing-ui";
import { rtl } from "testing-ui/adapters/rtl";

const locator = enhance(rtl(container, user));

// Now you can use shortcuts
const btn = locator.button({ name: "Submit" });
const input = locator.textbox({ name: "Email" });
```

## How It Works

`enhance()` creates a `LocatorProxy` that wraps the base locator and adds shortcut methods. Every method that returns a locator returns an enhanced `LocatorWith`, so chaining preserves the shortcuts:

```ts
const dialog = locator.dialog({ name: "Confirm" });
// dialog is also a LocatorWith, so shortcuts are available:
const okBtn = dialog.button({ name: "OK" });
```
