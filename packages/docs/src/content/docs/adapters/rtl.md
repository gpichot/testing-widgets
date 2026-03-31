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
