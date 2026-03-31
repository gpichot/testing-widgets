# testing-widgets

Framework and runner-agnostic UI testing abstractions using the **Widget Object Model** pattern.

Define your UI widgets once, then use them with both [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) and [Playwright](https://playwright.dev/) -- no duplication, full type safety.

## Why?

Page/component object models are a proven pattern for maintainable tests, but typically you end up writing separate abstractions for unit tests (RTL) and e2e tests (Playwright). `testing-widgets` lets you write a **single widget definition** that works with both.

```ts
import { widget } from "testing-widgets";

export const loginForm = widget((l) => ({
  elements: {
    email: l.byLabel("Email"),
    password: l.byLabel("Password"),
    submit: l.button({ name: "Sign in" }),
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

Then connect it to any adapter:

```ts
// React Testing Library
const { elements, actions } = loginForm.from(rtl(container, user));

// Playwright
const { elements, actions } = loginForm.from(playwright(page));
```

## Installation

```bash
npm install testing-widgets
# or
pnpm add testing-widgets
```

Peer dependencies (install the ones you need):

```bash
# For React Testing Library adapter
pnpm add -D @testing-library/react @testing-library/user-event

# For Playwright adapter
pnpm add -D @playwright/test
```

## Usage

### 1. Define a widget

```ts
// src/ContactForm.widgets.ts
import { widget } from "testing-widgets";

export const contactForm = widget((l) => ({
  elements: {
    heading: l.heading({ name: "Contact us" }),
    nameInput: l.byLabel("Name"),
    messageInput: l.byLabel("Message"),
    submitButton: l.button({ name: "Send" }),
    thankYou: (name: string) => l.heading({ name: `Thank you, ${name}!` }),
  },
  actions: {
    fillName: (name: string) => l.byLabel("Name").fill(name),
    submit: () => l.button({ name: "Send" }).click(),
  },
}));
```

### 2. Use with React Testing Library

```ts
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rtl } from "testing-widgets/adapters/rtl";
import { contactForm } from "../src/ContactForm.widgets.js";

const user = userEvent.setup();
const { container } = render(<ContactForm />);
const { elements, actions } = contactForm.from(rtl(container, user));

expect(elements.heading()).toHaveTextContent("Contact us");
await actions.fillName("Alice");
```

### 3. Use with Playwright

```ts
import { playwright } from "testing-widgets/adapters/playwright";
import { contactForm } from "../src/ContactForm.widgets.js";

const { elements, actions } = contactForm.from(playwright(page));

await expect(elements.heading.get()).toHaveText("Contact us");
await actions.fillName("Alice");
```

## Locator API

The factory callback receives an enhanced locator `l` with:

### Role shortcuts

`l.button()`, `l.heading()`, `l.textbox()`, `l.checkbox()`, `l.link()`, `l.radio()`, `l.combobox()`, `l.tab()`, `l.tabpanel()`, `l.dialog()`, `l.alert()`, `l.navigation()`, `l.list()`, `l.listitem()`

### Query shortcuts

- `l.byRole(role, options?)` -- find by ARIA role
- `l.byLabel(text)` -- find by label text
- `l.byText(text)` -- find by text content
- `l.byPlaceholder(text)` -- find by placeholder
- `l.byTitle(text)` -- find by title attribute
- `l.byTestId(id)` -- find by test ID

Each returns a `Locator` that exposes `.get()`, `.fill()`, `.click()`, `.check()`, `.selectOption()`, `.nth()`, `.filter()` and more.

## Project structure

```
packages/
  testing-ui/       Core library (published as "testing-widgets")
  example-react/    Full working example with RTL + Playwright tests
  docs/             Documentation site (Astro + Starlight)
```

## Development

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run linting/formatting check
pnpm check

# Auto-fix lint/format issues
pnpm check:fix

# Run unit tests (vitest)
pnpm test

# Run e2e tests (playwright -- requires browser install first)
pnpm --filter @testing-widgets/example-react exec playwright install chromium
pnpm test:e2e
```

## License

MIT
