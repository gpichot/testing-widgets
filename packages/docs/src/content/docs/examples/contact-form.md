---
title: "Example: Contact Form"
description: A complete example showing how to test a Contact Form with testing-ui.
---

This example demonstrates how a single widget definition is used across both unit tests (Vitest + React Testing Library) and E2E tests (Playwright).

## The Widget Definition

```ts
// src/ContactForm.widgets.ts
import { widget } from "testing-ui";

export const contactForm = widget((l) => ({
  elements: {
    heading: l.heading({ name: "Contact us" }),
    nameInput: l.byLabel("Name"),
    messageInput: l.byLabel("Message"),
    submitButton: l.button({ name: "Send" }),
    thankYou: (name: string) => l.heading({ name: `Thank you, ${name}!` }),
    confirmation: l.byText("Your message has been sent."),
  },
  actions: {
    fillName: (name: string) => l.byLabel("Name").fill(name),
    fillMessage: (msg: string) => l.byLabel("Message").fill(msg),
    submit: () => l.button({ name: "Send" }).click(),
    submitForm: async (name: string, message: string) => {
      await l.byLabel("Name").fill(name);
      await l.byLabel("Message").fill(message);
      await l.button({ name: "Send" }).click();
    },
  },
}));
```

### What's happening here

- **`elements`** — locators for each part of the form. Most are direct locators, but `thankYou` is a function because it needs a dynamic name.
- **`actions`** — reusable interactions. `submitForm` composes multiple steps into a single async action.
- The widget uses shortcuts like `l.heading()`, `l.button()`, `l.byLabel()`, and `l.byText()`.

## Unit Tests (Vitest + React Testing Library)

```ts
// tests/contact-form.test.tsx
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rtl } from "testing-ui/adapters/rtl";
import { describe, expect, it } from "vitest";
import { ContactForm } from "../src/ContactForm";
import { contactForm } from "../src/ContactForm.widgets";

function setup() {
  const user = userEvent.setup();
  const { container } = render(<ContactForm />);
  return contactForm.from(rtl(container, user));
}

describe("ContactForm (vitest + RTL)", () => {
  it("renders the form heading", () => {
    const { elements } = setup();
    expect(elements.heading()).toHaveTextContent("Contact us");
  });

  it("renders the form fields", () => {
    const { elements } = setup();
    expect(elements.nameInput()).toBeVisible();
    expect(elements.messageInput()).toBeVisible();
    expect(elements.submitButton()).toBeVisible();
  });

  it("fills in the name field", async () => {
    const { elements, actions } = setup();
    await actions.fillName("Alice");
    expect(elements.nameInput()).toHaveValue("Alice");
  });

  it("submits the form and shows confirmation", async () => {
    const { elements, actions } = setup();
    await actions.submitForm("Alice", "Hello!");

    expect(elements.thankYou("Alice").get()).toHaveTextContent(
      "Thank you, Alice!"
    );
    expect(elements.confirmation()).toHaveTextContent(
      "Your message has been sent."
    );
  });
});
```

### Key points

- `setup()` creates a `userEvent` instance, renders the component, and connects the widget via `rtl(container, user)`
- Elements are accessed with `elements.heading()` — the callable syntax resolves the locator
- Actions like `actions.fillName("Alice")` abstract away the interaction details

## E2E Tests (Playwright)

```ts
// e2e/contact-form.spec.ts
import { expect, test } from "@playwright/test";
import { playwright } from "testing-ui/adapters/playwright";
import { contactForm } from "../src/ContactForm.widgets";

test.describe("ContactForm (Playwright)", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("renders the form heading", async ({ page }) => {
    const { elements } = contactForm.from(playwright(page));
    await expect(elements.heading()).toHaveText("Contact us");
  });

  test("renders the form fields", async ({ page }) => {
    const { elements } = contactForm.from(playwright(page));
    await expect(elements.nameInput()).toBeVisible();
    await expect(elements.messageInput()).toBeVisible();
    await expect(elements.submitButton()).toBeVisible();
  });

  test("fills in the name field", async ({ page }) => {
    const { elements, actions } = contactForm.from(playwright(page));
    await actions.fillName("Alice");
    await expect(elements.nameInput()).toHaveValue("Alice");
  });

  test("submits the form and shows confirmation", async ({ page }) => {
    const { elements, actions } = contactForm.from(playwright(page));
    await actions.submitForm("Alice", "Hello!");

    await expect(elements.thankYou("Alice").get()).toHaveText(
      "Thank you, Alice!"
    );
    await expect(elements.confirmation()).toHaveText(
      "Your message has been sent."
    );
  });
});
```

### Key points

- The **same widget** (`contactForm`) and the **same test logic** — only the adapter changes
- `playwright(page)` replaces `rtl(container, user)`
- Playwright tests use `await expect(...)` for async assertions
- `elements.heading()` returns a Playwright locator that works with Playwright's `expect`

## Same Widget, Different Runners

The core value of testing-ui is visible here: both test files import the same `contactForm` widget. When the form's UI changes (e.g., the "Send" button is renamed to "Submit"), you update the widget definition in one place and both test suites continue to work.
