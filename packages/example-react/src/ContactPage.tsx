import { ContactForm } from "./ContactForm.js";

export function ContactPage() {
	return (
		<div>
			<nav aria-label="Main">
				<a href="/">Home</a>
				<a href="/contact">Contact</a>
			</nav>
			<h1>My App</h1>
			<section aria-label="Contact">
				<ContactForm />
			</section>
		</div>
	);
}
