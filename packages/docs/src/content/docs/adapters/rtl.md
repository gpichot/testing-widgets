---
title: React Testing Library
description: RTL adapter for testing-widgets.
---

```ts
import { rtl } from "testing-widgets/adapters/rtl";
```

## Signature

```ts
function rtl(container?: HTMLElement, user?: UserEventLike): Locator;
```

- **`container`** — root element to query within (defaults to `document.body`)
- **`user`** — optional `userEvent` instance for realistic interactions

## Usage

```ts
import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rtl } from "testing-widgets/adapters/rtl";

const user = userEvent.setup();
const { container } = render(<MyComponent />);
const locator = rtl(container, user);

const { elements, actions } = myWidget.from(locator);
```

## userEvent Integration

When `user` is provided, `click()`, `fill()`, `clear()`, and `selectOption()` delegate to `userEvent` for realistic browser behavior. Without it, the adapter falls back to native DOM methods.

## Async UI: `find()` and `findAll()`

Like RTL, synchronous resolution (`get()`, `()`, actions) does not wait. Use `find()` for elements that appear after an async update — it behaves like `findBy*`:

- resolves once **exactly one** element matches,
- rejects if **none** or **more than one** match after the timeout (default 1000ms).

`findAll()` behaves like `findAllBy*` (resolves once at least one matches).

```ts
await actions.submitForm("Alice", "Hello!");
expect(await elements.confirmation.find()).toHaveTextContent("Sent");
await elements.rows.findAll({ timeout: 3000 });
```

Waiting uses `waitFor` from `@testing-library/dom`, so it is wrapped in `act()` and works with fake timers.

## Query Engine

Queries are delegated to `@testing-library/dom` (`queryAllByRole`, `queryAllByLabelText`, `queryAllByText`, `queryAllByPlaceholderText`, `queryAllByTestId`), so matching is identical to React Testing Library:

- full accessible-name computation (`aria-labelledby`, `alt`, nested content…), hidden elements excluded from role queries,
- every implicit ARIA role, and the `checked`, `expanded`, `selected`, `pressed` role filters (`disabled` matches `:disabled` or an `aria-disabled="true"` ancestor),
- text matching on an element's own text with whitespace normalization; strings are exact, use a `RegExp` for partial matches,
- `configure({ testIdAttribute })` is honoured.

`@testing-library/dom` is a peer dependency of `@testing-library/react` and is required by this adapter (optional for Playwright-only users).

## Resolution semantics

| Method | RTL equivalent | No match | Several matches |
| ------ | -------------- | -------- | --------------- |
| `get()` / `()` | `getBy*` | throws | throws |
| `getAll()` | `getAllBy*` | throws | ok |
| `query()` | `queryBy*` | `null` | throws |
| `queryAll()` | `queryAllBy*` | `[]` | ok |
| `find()` | `findBy*` | rejects after timeout | rejects after timeout |
| `findAll()` | `findAllBy*` | rejects after timeout | ok |

Actions (`click()`, `fill()`, …) resolve with `get()`, so they throw on ambiguous matches instead of silently using the first one. Errors are `TestingLibraryElementError`s that include a DOM snapshot, like RTL.
