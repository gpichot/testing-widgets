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
	it("renders the form heading", async () => {
		const { elements } = setup();
		expect(await elements.heading().textContent()).toBe("Contact us");
	});

	it("renders the form fields", async () => {
		const { elements } = setup();
		expect(await elements.nameInput().isVisible()).toBe(true);
		expect(await elements.messageInput().isVisible()).toBe(true);
		expect(await elements.submitButton().isVisible()).toBe(true);
	});

	it("fills in the name field", async () => {
		const { elements, actions } = setup();
		await actions.fillName("Alice");
		expect(await elements.nameInput().inputValue()).toBe("Alice");
	});

	it("submits the form and shows confirmation", async () => {
		const { elements, actions } = setup();

		await actions.submitForm("Alice", "Hello!");

		expect(await elements.thankYou("Alice").textContent()).toBe(
			"Thank you, Alice!",
		);
		expect(await elements.confirmation().textContent()).toBe(
			"Your message has been sent.",
		);
	});
});
