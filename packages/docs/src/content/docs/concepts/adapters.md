---
title: Adapters
description: How adapters bridge testing-ui with testing frameworks.
---

Adapters are the bridge between testing-ui's abstract `Locator` interface and concrete testing frameworks. Each adapter implements the `LocatorMethods` interface using the underlying framework's API.

## How Adapters Work

```
Widget Definition
      │
      ▼
  widget.from(adapter)
      │
      ▼
  Adapter (rtl / playwright)
      │
      ▼
  Testing Framework (RTL / Playwright)
```

1. You define a widget using the `widget()` function
2. You call `.from(adapter)` to connect the widget to a specific testing framework
3. The adapter translates `Locator` method calls into framework-specific API calls

## Available Adapters

### React Testing Library (`rtl`)

```ts
import { rtl } from "testing-ui/adapters/rtl";

const locator = rtl(container, user);
```

- Works with `@testing-library/react`
- Optional `userEvent` integration for realistic interactions
- Implements its own minimal DOM query engine (no `@testing-library/dom` dependency)
- Synchronous resolution

See [RTL Adapter](/adapters/rtl/) for full details.

### Playwright (`playwright`)

```ts
import { playwright } from "testing-ui/adapters/playwright";

const locator = playwright(page);
```

- Thin wrapper around Playwright's native locator API
- Async by nature — locators are lazy
- No compile-time dependency on `@playwright/test`

See [Playwright Adapter](/adapters/playwright/) for full details.

## Writing Custom Adapters

You can create a custom adapter by implementing the `LocatorMethods` interface and wrapping it with `asCallable()`:

```ts
import { asCallable } from "testing-ui";
import type { Locator, LocatorMethods } from "testing-ui";

class MyAdapter implements LocatorMethods {
  getByRole(role: string, options?: ByRoleOptions): Locator {
    // Your implementation — return a new Locator
    return asCallable(new MyAdapter(/* scoped context */));
  }

  get(): unknown {
    // Return the underlying element
  }

  // ... implement all other LocatorMethods
}

export function myAdapter(root: MyRoot): Locator {
  return asCallable(new MyAdapter(root));
}
```

The key requirement is that each query method (`getByRole`, `getByLabel`, etc.) returns a new `Locator` that is scoped to the matched element.
