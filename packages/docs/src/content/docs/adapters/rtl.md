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

Waiting uses `waitFor` from `@testing-library/dom` when installed (it is a peer of `@testing-library/react`), so it is wrapped in `act()` and works with fake timers. Without it, a built-in MutationObserver + polling fallback is used.

## Built-in Query Engine

The adapter has its own lightweight DOM query engine — no `@testing-library/dom` dependency. It supports these implicit role mappings:

| Role | Selectors |
| ---- | --------- |
| `button` | `button`, `[role="button"]`, `input[type="button"\|"submit"]` |
| `textbox` | `input` (no type / `type="text"`), `textarea`, `[role="textbox"]` |
| `checkbox` | `input[type="checkbox"]`, `[role="checkbox"]` |
| `radio` | `input[type="radio"]`, `[role="radio"]` |
| `link` | `a[href]`, `[role="link"]` |
| `heading` | `h1`–`h6`, `[role="heading"]` |
| `list` | `ul`, `ol`, `[role="list"]` |
| `listitem` | `li`, `[role="listitem"]` |
| `combobox` | `select`, `[role="combobox"]` |
| `dialog` | `dialog`, `[role="dialog"]` |
| `img` | `img[alt]`, `[role="img"]` |

Other roles fall back to `[role="..."]`. Name matching checks `aria-label` then text content.
