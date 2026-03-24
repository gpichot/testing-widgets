---
title: "Example: Contact Form"
description: A real-world example testing a Contact Form across two runners.
---

This example shows a single widget definition used in both Vitest+RTL and Playwright tests.

## Widget Definition

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

## Unit Test (Vitest + RTL)

```ts
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rtl } from "testing-ui/adapters/rtl";
import { contactForm } from "../src/ContactForm.widgets";

function setup() {
  const user = userEvent.setup();
  const { container } = render(<ContactForm />);
  return contactForm.from(rtl(container, user));
}

it("submits the form and shows confirmation", async () => {
  const { elements, actions } = setup();
  await actions.submitForm("Alice", "Hello!");

  expect(elements.thankYou("Alice").get()).toHaveTextContent("Thank you, Alice!");
  expect(elements.confirmation()).toHaveTextContent("Your message has been sent.");
});
```

## E2E Test (Playwright)

```ts
import { test, expect } from "@playwright/test";
import { playwright } from "testing-ui/adapters/playwright";
import { contactForm } from "../src/ContactForm.widgets";

test("submits the form and shows confirmation", async ({ page }) => {
  await page.goto("/");
  const { elements, actions } = contactForm.from(playwright(page));

  await actions.submitForm("Alice", "Hello!");

  await expect(elements.thankYou("Alice").get()).toHaveText("Thank you, Alice!");
  await expect(elements.confirmation()).toHaveText("Your message has been sent.");
});
```

Same widget, same test logic — only the adapter differs.
