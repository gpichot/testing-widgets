import { useState } from "react";

export function ContactForm() {
	const [submitted, setSubmitted] = useState(false);
	const [name, setName] = useState("");
	const [message, setMessage] = useState("");

	if (submitted) {
		return (
			<div>
				<h2>Thank you, {name}!</h2>
				<p>Your message has been sent.</p>
			</div>
		);
	}

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				setSubmitted(true);
			}}
		>
			<h1>Contact us</h1>
			<div>
				<label htmlFor="name">Name</label>
				<input
					id="name"
					value={name}
					onChange={(e) => setName(e.target.value)}
				/>
			</div>
			<div>
				<label htmlFor="message">Message</label>
				<textarea
					id="message"
					value={message}
					onChange={(e) => setMessage(e.target.value)}
				/>
			</div>
			<button type="submit">Send</button>
		</form>
	);
}
