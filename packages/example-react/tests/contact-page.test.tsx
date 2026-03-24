import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rtl } from "testing-ui/adapters/rtl";
import { describe, expect, it } from "vitest";
import { ContactPage } from "../src/ContactPage.js";
import { contactPage } from "../src/ContactPage.widgets.js";

function setup() {
	const user = userEvent.setup();
	const { container } = render(<ContactPage />);
	return contactPage.from(rtl(container, user));
}

describe("ContactPage (vitest + RTL)", () => {
	it("renders the page title", () => {
		const { elements } = setup();
		expect(elements.pageTitle()).toHaveTextContent("My App");
	});

	it("renders navigation links", () => {
		const { elements } = setup();
		expect(elements.homeLink()).toBeVisible();
		expect(elements.contactLink()).toBeVisible();
	});

	it("reuses the contact form widget to fill and submit", async () => {
		const { widgets } = setup();
		const { elements, actions } = widgets.contactForm;

		await actions.submitForm("Bob", "Hi there!");

		expect(elements.thankYou("Bob").get()).toHaveTextContent(
			"Thank you, Bob!",
		);
		expect(elements.confirmation()).toHaveTextContent(
			"Your message has been sent.",
		);
	});
});
