---
title: Quick Start
description: Get up and running with testing-ui in minutes.
---

This guide walks you through creating your first widget and using it in tests.

## 1. Define a Widget

Create a widget file that describes your component's UI structure:

```ts
// src/LoginForm.widgets.ts
import { widget } from "testing-ui";

export const loginForm = widget((l) => ({
  elements: {
    emailInput: l.byLabel("Email"),
    passwordInput: l.byLabel("Password"),
    submitButton: l.button({ name: "Sign in" }),
    errorMessage: l.byRole("alert"),
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

## 2. Use in Unit Tests (React Testing Library)

```ts
// tests/login-form.test.tsx
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rtl } from "testing-ui/adapters/rtl";
import { loginForm } from "../src/LoginForm.widgets";
import { LoginForm } from "../src/LoginForm";

function setup() {
  const user = userEvent.setup();
  const { container } = render(<LoginForm />);
  return loginForm.from(rtl(container, user));
}

it("renders the form fields", () => {
  const { elements } = setup();
  expect(elements.emailInput()).toBeVisible();
  expect(elements.passwordInput()).toBeVisible();
  expect(elements.submitButton()).toBeVisible();
});

it("logs in successfully", async () => {
  const { actions } = setup();
  await actions.login("alice@example.com", "password123");
  // assert on expected outcome...
});
```

## 3. Use in E2E Tests (Playwright)

```ts
// e2e/login-form.spec.ts
import { test, expect } from "@playwright/test";
import { playwright } from "testing-ui/adapters/playwright";
import { loginForm } from "../src/LoginForm.widgets";

test("logs in successfully", async ({ page }) => {
  await page.goto("/login");
  const { elements, actions } = loginForm.from(playwright(page));

  await actions.login("alice@example.com", "password123");

  await expect(elements.submitButton()).not.toBeVisible();
});
```

## Key Takeaway

Notice how the **same widget definition** (`loginForm`) is used in both test files. The only difference is the adapter:
- `rtl(container, user)` for React Testing Library
- `playwright(page)` for Playwright

This is the core value of testing-ui — **write your widget selectors and actions once, use them everywhere**.
