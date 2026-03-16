import { widget } from "testing-ui";

/**
 * Widget definition for the ContactForm component.
 *
 * This SAME definition is used by:
 * - vitest + React Testing Library (tests/contact-form.test.tsx)
 * - Playwright (e2e/contact-form.spec.ts)
 */
export const contactForm = widget((l) => ({
	elements: {
		heading: () => l.heading({ name: "Contact us" }),
		nameInput: () => l.byLabel("Name"),
		messageInput: () => l.byLabel("Message"),
		submitButton: () => l.button({ name: "Send" }),
		thankYou: (name: string) => l.heading({ name: `Thank you, ${name}!` }),
		confirmation: () => l.byText("Your message has been sent."),
	},
	actions: {
		fillName: (name: string) => l.byLabel("Name").fill(name),
		fillMessage: (msg: string) => l.byLabel("Message").fill(msg),
		submit: () => l.button({ name: "Send" }).click(),
		submitForm: async (name: string, message: string) => {
			await l.byLabel("Name").fill(name);
			await l.byLabel("Message").fill(message);
			await l.button({ name: "Send" }).click();
		},
	},
}));
