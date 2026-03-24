---
title: Installation
description: How to install testing-ui in your project.
---

## Install the package

```bash
npm install testing-ui
```

Or with other package managers:

```bash
pnpm add testing-ui
yarn add testing-ui
```

## Peer Dependencies

**testing-ui** has optional peer dependencies depending on which adapter you use:

### React Testing Library adapter

```bash
npm install @testing-library/react @testing-library/user-event
```

### Playwright adapter

```bash
npm install @playwright/test
```

You only need to install the dependencies for the adapters you plan to use. The adapters use minimal interfaces internally, so they avoid compile-time dependencies on these libraries.

## Package Exports

The package provides the following entry points:

| Import path                    | Description                        |
| ------------------------------ | ---------------------------------- |
| `testing-ui`                   | Core API (`widget`, `enhance`, `asCallable`, types) |
| `testing-ui/adapters/rtl`      | React Testing Library adapter      |
| `testing-ui/adapters/playwright` | Playwright adapter                |

## TypeScript

**testing-ui** is written in TypeScript and ships with full type definitions. No additional `@types` packages are needed.

The library targets ES2022 and uses ESM modules.
