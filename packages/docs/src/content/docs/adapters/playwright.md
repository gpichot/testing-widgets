---
title: Playwright
description: Playwright adapter for testing-widgets.
---

```ts
import { playwright } from "testing-widgets/adapters/playwright";
```

## Signature

```ts
function playwright(page: PwLocatable): Locator;
```

Accepts a Playwright `Page`, `Locator`, or anything matching the `PwLocatable` interface. No compile-time dependency on `@playwright/test`.

## Usage

```ts
import { test, expect } from "@playwright/test";
import { playwright } from "testing-widgets/adapters/playwright";

test("example", async ({ page }) => {
  await page.goto("/");
  const { elements, actions } = myWidget.from(playwright(page));

  await actions.doSomething();
  await expect(elements.heading()).toHaveText("Done");
});
```

## Resolution Differences

Playwright locators are inherently lazy, so some resolution methods behave differently:

| Method | Behavior |
| ------ | -------- |
| `get()` / `query()` | Returns the Playwright locator directly |
| `find()` | Returns the Playwright locator (async) |
| `getAll()` / `queryAll()` | **Throws** — use `await locator.get().all()` instead |

Everything else (`click`, `fill`, `check`, state queries, etc.) maps directly to the Playwright API.
