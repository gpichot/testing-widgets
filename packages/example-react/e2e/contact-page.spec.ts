import { expect, test } from "@playwright/test";
import { playwright } from "testing-ui/adapters/playwright";
import { contactPage } from "../src/ContactPage.widgets.js";

test.describe("ContactPage (Playwright)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/contact");
	});

	test("renders the page title", async ({ page }) => {
		const { elements } = contactPage.from(playwright(page));
		await expect(elements.pageTitle()).toHaveText("My App");
	});

	test("renders navigation links", async ({ page }) => {
		const { elements } = contactPage.from(playwright(page));
		await expect(elements.homeLink()).toBeVisible();
		await expect(elements.contactLink()).toBeVisible();
	});

	test("reuses the contact form widget to submit", async ({ page }) => {
		const { widgets } = contactPage.from(playwright(page));
		const { elements, actions } = widgets.contactForm;

		await actions.submitForm("Bob", "Hi there!");

		await expect(elements.thankYou("Bob").get()).toHaveText("Thank you, Bob!");
		await expect(elements.confirmation()).toHaveText(
			"Your message has been sent.",
		);
	});
});
