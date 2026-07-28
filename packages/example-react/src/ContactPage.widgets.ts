import { widget } from "testing-ui";
import { contactForm } from "./ContactForm.widgets.js";

/**
 * Widget for the ContactPage component.
 *
 * Demonstrates widget reuse: the `contactForm` widget is composed
 * inside this page-level widget by scoping a locator to the
 * "Contact" region and passing it to `contactForm.from()`.
 */
export const contactPage = widget((l) => {
	const form = contactForm.from(l.region({ name: "Contact" }));

	return {
		elements: {
			pageTitle: l.heading({ name: "My App" }),
			homeLink: l.navigation({ name: "Main" }).link({ name: "Home" }),
			contactLink: l.navigation({ name: "Main" }).link({
				name: "Contact",
			}),
		},
		widgets: {
			contactForm: form,
		},
	};
});
