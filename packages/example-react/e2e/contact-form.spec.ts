import { expect, test } from "@playwright/test";
import { playwright } from "testing-ui/adapters/playwright";
import { contactForm } from "../src/ContactForm.widgets.js";

test.describe("ContactForm (Playwright)", () => {
	test.beforeEach(async ({ page }) => {
		await page.goto("/");
	});

	test("renders the form heading", async ({ page }) => {
		const { elements } = contactForm.from(playwright(page));
		await expect
			.poll(() => elements.heading().textContent())
			.toBe("Contact us");
	});

	test("renders the form fields", async ({ page }) => {
		const { elements } = contactForm.from(playwright(page));
		expect(await elements.nameInput().isVisible()).toBe(true);
		expect(await elements.messageInput().isVisible()).toBe(true);
		expect(await elements.submitButton().isVisible()).toBe(true);
	});

	test("fills in the name field", async ({ page }) => {
		const { elements, actions } = contactForm.from(playwright(page));
		await actions.fillName("Alice");
		expect(await elements.nameInput().inputValue()).toBe("Alice");
	});

	test("submits the form and shows confirmation", async ({ page }) => {
		const { elements, actions } = contactForm.from(playwright(page));

		await actions.submitForm("Alice", "Hello!");

		await expect
			.poll(() => elements.thankYou("Alice").textContent())
			.toBe("Thank you, Alice!");
		expect(await elements.confirmation().textContent()).toBe(
			"Your message has been sent.",
		);
	});
});
