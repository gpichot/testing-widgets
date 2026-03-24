---
title: Playwright Adapter
description: Using testing-ui with Playwright for E2E tests.
---

The Playwright adapter connects testing-ui to [Playwright](https://playwright.dev/).

## Import

```ts
import { playwright } from "testing-ui/adapters/playwright";
```

## Signature

```ts
function playwright(page: PwLocatable): Locator;
```

### Parameters

| Parameter | Type | Description |
| --------- | ---- | ----------- |
| `page` | `PwLocatable` | A Playwright `Page`, `Locator`, or any object matching the `PwLocatable` interface |

### Returns

A `Locator` bound to the page or locator.

## Usage

```ts
import { test, expect } from "@playwright/test";
import { playwright } from "testing-ui/adapters/playwright";
import { myWidget } from "../src/MyWidget.widgets";

test("example", async ({ page }) => {
  await page.goto("/");
  const { elements, actions } = myWidget.from(playwright(page));

  await actions.doSomething();
  await expect(elements.result()).toHaveText("Done");
});
```

## How It Works

The Playwright adapter is a thin wrapper around Playwright's native locator API. Each testing-ui method maps directly to a Playwright method:

| testing-ui | Playwright |
| ---------- | ---------- |
| `getByRole()` | `page.getByRole()` |
| `getByLabel()` | `page.getByLabel()` |
| `getByPlaceholder()` | `page.getByPlaceholder()` |
| `getByText()` | `page.getByText()` |
| `getByTestId()` | `page.getByTestId()` |
| `click()` | `locator.click()` |
| `fill()` | `locator.fill()` |
| `check()` | `locator.check()` |
| `uncheck()` | `locator.uncheck()` |
| `selectOption()` | `locator.selectOption()` |
| `clear()` | `locator.clear()` |

## Resolution Differences

Because Playwright locators are inherently lazy and async, some resolution methods behave differently:

| Method | Behavior |
| ------ | -------- |
| `get()` | Returns the Playwright locator (no waiting) |
| `query()` | Returns the Playwright locator (same as `get()`) |
| `find()` | Returns the Playwright locator (async) |
| `getAll()` | Throws — use `await locator.get().all()` instead |
| `queryAll()` | Throws — use `await locator.get().all()` instead |

## No Compile-Time Dependency

The adapter uses a minimal `PwLocatable` interface instead of importing from `@playwright/test`. This means:
- The `testing-ui` package doesn't need `@playwright/test` installed to compile
- You only need Playwright in your E2E test project

## Complete Example

```ts
import { test, expect } from "@playwright/test";
import { playwright } from "testing-ui/adapters/playwright";
import { contactForm } from "../src/ContactForm.widgets";

test.describe("ContactForm", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("submits the form", async ({ page }) => {
    const { elements, actions } = contactForm.from(playwright(page));

    await actions.submitForm("Alice", "Hello!");

    await expect(elements.thankYou("Alice").get()).toHaveText(
      "Thank you, Alice!"
    );
  });
});
```
