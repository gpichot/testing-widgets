import { render } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { rtl } from "testing-ui/adapters/rtl";
import { describe, expect, it } from "vitest";
import { ContactForm } from "../src/ContactForm.js";
import { contactForm } from "../src/ContactForm.widgets.js";

function setup() {
	const user = userEvent.setup();
	const { container } = render(<ContactForm />);
	return contactForm.from(rtl(container, user));
}

describe("ContactForm (vitest + RTL)", () => {
	it("renders the form heading", () => {
		const { elements } = setup();
		expect(elements.heading()).toHaveTextContent("Contact us");
	});

	it("renders the form fields", () => {
		const { elements } = setup();
		expect(elements.nameInput()).toBeVisible();
		expect(elements.messageInput()).toBeVisible();
		expect(elements.submitButton()).toBeVisible();
	});

	it("fills in the name field", async () => {
		const { elements, actions } = setup();
		await actions.fillName("Alice");
		expect(elements.nameInput()).toHaveValue("Alice");
	});

	it("submits the form and shows confirmation", async () => {
		const { elements, actions } = setup();

		await actions.submitForm("Alice", "Hello!");

		expect(elements.thankYou("Alice").get()).toHaveTextContent(
			"Thank you, Alice!",
		);
		expect(elements.confirmation()).toHaveTextContent(
			"Your message has been sent.",
		);
	});
});
