---
title: Widget Object Model
description: Understanding the Widget Object Model pattern used by testing-ui.
---

The **Widget Object Model (WOM)** is a pattern for structuring UI tests around reusable, composable abstractions. It is similar to the Page Object Model but operates at the component level.

## What is a Widget?

A widget is a reusable test abstraction that encapsulates:

- **Elements** — how to locate parts of a UI component
- **Actions** — how to interact with the component (fill forms, click buttons, etc.)

```ts
import { widget } from "testing-ui";

const searchBar = widget((l) => ({
  elements: {
    input: l.textbox({ name: "Search" }),
    submitButton: l.button({ name: "Search" }),
    clearButton: l.button({ name: "Clear" }),
  },
  actions: {
    search: async (query: string) => {
      await l.textbox({ name: "Search" }).fill(query);
      await l.button({ name: "Search" }).click();
    },
    clear: () => l.button({ name: "Clear" }).click(),
  },
}));
```

## Why Widget Object Model?

### Reusability across test runners

The same widget definition works with React Testing Library, Playwright, and any future adapter:

```ts
// Unit test
const { elements, actions } = searchBar.from(rtl(container, user));

// E2E test
const { elements, actions } = searchBar.from(playwright(page));
```

### Single source of truth

When your UI changes, you only need to update the widget definition — not every test file that references those selectors.

### Separation of concerns

Tests focus on **behavior** ("when I search for X, I should see Y"), while widgets handle **mechanics** ("the search input has the label 'Search'").

## Composing Widgets

Widgets can reference other widgets or combine multiple locators:

```ts
const productCard = widget((l) => ({
  elements: {
    title: l.heading(),
    price: l.byTestId("price"),
    addToCart: l.button({ name: "Add to cart" }),
  },
  actions: {
    addToCart: () => l.button({ name: "Add to cart" }).click(),
  },
}));
```

## Widget Structure

The `widget()` function takes a factory that receives an enhanced locator (`LocatorWith`) and returns any object shape you want. There is no required structure — you decide how to organize elements and actions:

```ts
// Flat structure
const myWidget = widget((l) => ({
  title: l.heading(),
  submit: () => l.button({ name: "Submit" }).click(),
}));

// Nested structure
const myWidget = widget((l) => ({
  elements: { title: l.heading() },
  actions: { submit: () => l.button({ name: "Submit" }).click() },
}));
```

The `elements` / `actions` pattern is a convention, not a requirement.
