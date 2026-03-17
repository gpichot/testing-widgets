import { expect, test } from "@playwright/test";
import { playwright } from "testing-ui/adapters/playwright";
import { contactForm } from "../src/ContactForm.widgets.js";

test.describe("ContactForm (Playwright)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("renders the form heading", async ({ page }) => {
		const { elements } = contactForm.from(playwright(page));
		await expect(elements.heading().get()).toHaveText("Contact us");
	});

	test("renders the form fields", async ({ page }) => {
		const { elements } = contactForm.from(playwright(page));
		await expect(elements.nameInput().get()).toBeVisible();
		await expect(elements.messageInput().get()).toBeVisible();
		await expect(elements.submitButton().get()).toBeVisible();
	});

	test("fills in the name field", async ({ page }) => {
		const { elements, actions } = contactForm.from(playwright(page));
		await actions.fillName("Alice");
		await expect(elements.nameInput().get()).toHaveValue("Alice");
	});

	test("submits the form and shows confirmation", async ({ page }) => {
		const { elements, actions } = contactForm.from(playwright(page));

		await actions.submitForm("Alice", "Hello!");

		await expect(elements.thankYou("Alice").get()).toHaveText(
			"Thank you, Alice!",
		);
		await expect(elements.confirmation().get()).toHaveText(
			"Your message has been sent.",
		);
	});
});
