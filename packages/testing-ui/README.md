# testing-widgets

Framework and runner-agnostic UI testing abstractions using the **Widget Object Model** pattern.

Define your UI widgets once, then use them with both [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) and [Playwright](https://playwright.dev/) -- no duplication, full type safety.

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

## AI agent skills

This package ships [TanStack Intent](https://github.com/TanStack/intent) skills under `skills/`, so AI coding agents (Claude Code, Cursor, Copilot, ...) know how to use the library correctly:

- **`define-widget`** -- authoring or refactoring a `widget((l) => ...)` definition.
- **`wire-rtl`** -- adopting a widget inside a Vitest + React Testing Library suite.
- **`wire-playwright`** -- adopting a widget inside a Playwright e2e suite.

Install them into your agent with:

```bash
npx @tanstack/intent@latest install
```

## Documentation

Full docs, recipes, and the source repository live at <https://github.com/gpichot/testing-widgets>.

## License

MIT
