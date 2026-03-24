import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

export default defineConfig({
  integrations: [
    starlight({
      title: "testing-ui",
      description:
        "Framework and runner agnostic UI testing abstractions using the Widget Object Model pattern.",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/gpichot/testing-ui",
        },
      ],
      sidebar: [
        {
          label: "Getting Started",
          items: [
            { label: "Introduction", slug: "getting-started/introduction" },
            { label: "Installation", slug: "getting-started/installation" },
            { label: "Quick Start", slug: "getting-started/quick-start" },
          ],
        },
        {
          label: "Core Concepts",
          items: [
            {
              label: "Widget Object Model",
              slug: "concepts/widget-object-model",
            },
            { label: "Locators", slug: "concepts/locators" },
            { label: "Adapters", slug: "concepts/adapters" },
          ],
        },
        {
          label: "API Reference",
          items: [
            { label: "widget()", slug: "api/widget" },
            { label: "enhance()", slug: "api/enhance" },
            { label: "asCallable()", slug: "api/as-callable" },
            { label: "Locator", slug: "api/locator" },
            { label: "LocatorWith", slug: "api/locator-with" },
          ],
        },
        {
          label: "Adapters",
          items: [
            {
              label: "React Testing Library",
              slug: "adapters/rtl",
            },
            { label: "Playwright", slug: "adapters/playwright" },
          ],
        },
        {
          label: "Examples",
          items: [
            { label: "Contact Form", slug: "examples/contact-form" },
          ],
        },
      ],
    }),
  ],
});
