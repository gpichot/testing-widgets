---
title: Introduction
description: What is testing-ui and why should you use it?
---

**testing-ui** is a framework and runner agnostic UI testing abstraction layer. It implements the **Widget Object Model** pattern — a structured approach to UI testing where you define reusable widget objects that encapsulate how to find and interact with UI components.

## The Problem

When testing UI components, you often write the same selectors and interactions across multiple test suites. If you use both unit tests (React Testing Library) and end-to-end tests (Playwright), you end up duplicating widget knowledge:

```ts
// In your RTL tests
const nameInput = screen.getByLabelText("Name");
await userEvent.type(nameInput, "Alice");
await userEvent.click(screen.getByRole("button", { name: "Send" }));

// In your Playwright tests
await page.getByLabel("Name").fill("Alice");
await page.getByRole("button", { name: "Send" }).click();
```

The selectors are the same, the intent is the same — but the code is different because the APIs differ.

## The Solution

**testing-ui** provides a unified `Locator` interface that works across testing frameworks. You define your widget once:

```ts
import { widget } from "testing-ui";

const contactForm = widget((l) => ({
  elements: {
    nameInput: l.byLabel("Name"),
    submitButton: l.button({ name: "Send" }),
  },
  actions: {
    submitForm: async (name: string) => {
      await l.byLabel("Name").fill(name);
      await l.button({ name: "Send" }).click();
    },
  },
}));
```

Then use it in any test runner:

```ts
// React Testing Library
const { elements, actions } = contactForm.from(rtl(container, user));

// Playwright
const { elements, actions } = contactForm.from(playwright(page));
```

## Key Features

- **Widget Object Model** — Reusable test abstractions that encapsulate UI structure and behavior
- **Framework agnostic** — One widget definition works with RTL, Playwright, and future adapters
- **Lazy evaluation** — Locator queries are resolved only when accessed
- **Role-based locators** — ARIA-first query strategy with shortcuts like `button()`, `heading()`, `textbox()`
- **Callable syntax** — `locator()` as shorthand for `locator.get()`
- **Locator chaining** — Scoped queries for nested element selection
- **Zero runtime dependencies** — Adapters use minimal interfaces to avoid compile-time dependencies
