---
title: Getting Started
description: Install testing-widgets and write your first widget.
---

## Install

```bash
npm install testing-widgets
```

Then install the adapter(s) you need:

```bash
# For React Testing Library
npm install @testing-library/react @testing-library/user-event

# For Playwright
npm install @playwright/test
```

## The Idea

UI tests duplicate selector knowledge across test runners. testing-widgets fixes this with the **Widget Object Model** — you define selectors and actions once in a widget, then connect it to any test runner via an adapter.

```ts
import { widget } from "testing-widgets";

const loginForm = widget((l) => ({
  email: l.byLabel("Email"),
  password: l.byLabel("Password"),
  submit: l.button({ name: "Sign in" }),
  login: async (email: string, password: string) => {
    await l.byLabel("Email").fill(email);
    await l.byLabel("Password").fill(password);
    await l.button({ name: "Sign in" }).click();
  },
}));
```

Use it with any adapter — same widget, different runner:

```ts
// Unit test (React Testing Library)
const { email, login } = loginForm.from(rtl(container, user));

// E2E test (Playwright)
const { email, login } = loginForm.from(playwright(page));
```

## Package Exports

| Import | Contents |
| ------ | -------- |
| `testing-widgets` | `widget`, `enhance`, `asCallable`, types |
| `testing-widgets/adapters/rtl` | React Testing Library adapter |
| `testing-widgets/adapters/playwright` | Playwright adapter |
