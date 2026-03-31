import { type Locator as PwLocator, expect, test } from "@playwright/test";
import { playwright } from "testing-widgets/adapters/playwright";
import { contactForm } from "../src/ContactForm.widgets.js";

test.describe("ContactForm (Playwright)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("renders the form heading", async ({ page }) => {
		const { elements } = contactForm.from(playwright(page));
		await expect(elements.heading.get() as PwLocator).toHaveText("Contact us");
	});

	test("renders the form fields", async ({ page }) => {
		const { elements } = contactForm.from(playwright(page));
		await expect(elements.nameInput.get() as PwLocator).toBeVisible();
		await expect(elements.messageInput.get() as PwLocator).toBeVisible();
		await expect(elements.submitButton.get() as PwLocator).toBeVisible();
	});

	test("fills in the name field", async ({ page }) => {
		const { elements, actions } = contactForm.from(playwright(page));
		await actions.fillName("Alice");
		await expect(elements.nameInput.get() as PwLocator).toHaveValue("Alice");
	});

	test("submits the form and shows confirmation", async ({ page }) => {
		const { elements, actions } = contactForm.from(playwright(page));

		await actions.submitForm("Alice", "Hello!");

		await expect(elements.thankYou("Alice").get() as PwLocator).toHaveText(
			"Thank you, Alice!",
		);
		await expect(elements.confirmation.get() as PwLocator).toHaveText(
			"Your message has been sent.",
		);
	});
});
