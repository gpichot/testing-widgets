---
title: asCallable()
description: API reference for the asCallable() utility function.
---

The `asCallable()` function wraps a `LocatorMethods` implementation so it can be called as a function.

## Import

```ts
import { asCallable } from "testing-ui";
```

## Signature

```ts
function asCallable(impl: LocatorMethods): Locator;
```

### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `impl` | `LocatorMethods` | An object implementing the LocatorMethods interface |

### Returns

A `Locator` — a callable version of the implementation where calling it directly invokes `.get()`.

## Usage

This is primarily used by adapter authors. It turns a method-based implementation into a callable locator:

```ts
import { asCallable } from "testing-ui";
import type { LocatorMethods, Locator } from "testing-ui";

class MyLocatorImpl implements LocatorMethods {
  get() {
    return this.element;
  }
  // ... other methods
}

const locator: Locator = asCallable(new MyLocatorImpl());

// These are now equivalent:
locator();      // calls impl.get()
locator.get();  // calls impl.get() directly
```

## How It Works

`asCallable()` uses a JavaScript `Proxy` to combine function call behavior with method access:

1. The returned object is a function that calls `impl.get()` when invoked
2. Property access is forwarded to the original `impl` object
3. This allows the locator to be both callable and have methods
