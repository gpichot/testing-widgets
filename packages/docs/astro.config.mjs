import starlight from "@astrojs/starlight";
import { defineConfig } from "astro/config";

export default defineConfig({
	integrations: [
		starlight({
			title: "testing-widgets",
			description:
				"Framework and runner agnostic UI testing abstractions using the Widget Object Model pattern.",
			social: [
				{
					icon: "github",
					label: "GitHub",
					href: "https://github.com/gpichot/testing-widgets",
				},
			],
			sidebar: [
				{ label: "Getting Started", slug: "getting-started" },
				{
					label: "API Reference",
					items: [
						{ label: "widget()", slug: "api/widget" },
						{ label: "Locator", slug: "api/locator" },
						{ label: "LocatorWith", slug: "api/locator-with" },
					],
				},
				{
					label: "Adapters",
					items: [
						{ label: "React Testing Library", slug: "adapters/rtl" },
						{ label: "Playwright", slug: "adapters/playwright" },
					],
				},
				{
					label: "Examples",
					items: [{ label: "Contact Form", slug: "examples/contact-form" }],
				},
			],
		}),
	],
});
