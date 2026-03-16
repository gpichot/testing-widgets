import { afterEach, describe, expect, it, vi } from "vitest";
import { rtl } from "../adapters/rtl.js";
import { widget } from "../widget.js";

describe("rtl adapter", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("queries elements by role", () => {
		document.body.innerHTML = "<button>Save</button>";
		const locator = rtl(document.body);
		const btn = locator.getByRole("button", { name: "Save" });
		expect(btn).toBeDefined();
	});

	it("queries elements by label", () => {
		document.body.innerHTML =
			'<label for="email">Email</label><input id="email" />';
		const locator = rtl(document.body);
		const input = locator.getByLabel("Email");
		expect(input).toBeDefined();
	});

	it("queries elements by text", () => {
		document.body.innerHTML = "<p>Hello world</p>";
		const locator = rtl(document.body);
		const el = locator.getByText("Hello world");
		expect(el).toBeDefined();
	});

	it("queries elements by placeholder", () => {
		document.body.innerHTML = '<input placeholder="Search..." />';
		const locator = rtl(document.body);
		const el = locator.getByPlaceholder("Search...");
		expect(el).toBeDefined();
	});

	it("queries elements by test id", () => {
		document.body.innerHTML = '<div data-testid="my-el">content</div>';
		const locator = rtl(document.body);
		const el = locator.getByTestId("my-el");
		expect(el).toBeDefined();
	});

	it("queries with regex", () => {
		document.body.innerHTML = "<button>Submit form</button>";
		const locator = rtl(document.body);
		const btn = locator.getByRole("button", { name: /submit/i });
		expect(btn).toBeDefined();
	});

	it("throws when element is not found (on interaction)", async () => {
		document.body.innerHTML = "";
		const locator = rtl(document.body);
		// Locators are lazy — error surfaces when interacting
		await expect(locator.getByRole("button").click()).rejects.toThrow(
			'Unable to find element with role "button"',
		);
	});

	it("reads text content", async () => {
		document.body.innerHTML = "<p>Hello</p>";
		const locator = rtl(document.body).getByText("Hello");
		expect(await locator.textContent()).toBe("Hello");
	});

	it("reads attributes", async () => {
		document.body.innerHTML = '<a href="/home">Home</a>';
		const locator = rtl(document.body).getByRole("link", { name: "Home" });
		expect(await locator.getAttribute("href")).toBe("/home");
	});

	it("clicks elements", async () => {
		const handler = vi.fn();
		document.body.innerHTML = "<button>Click me</button>";
		document.body.querySelector("button")?.addEventListener("click", handler);

		const locator = rtl(document.body);
		await locator.getByRole("button", { name: "Click me" }).click();

		expect(handler).toHaveBeenCalledOnce();
	});

	it("clicks elements using userEvent when provided", async () => {
		const mockUser = {
			click: vi.fn(async () => {}),
			type: vi.fn(async () => {}),
			clear: vi.fn(async () => {}),
			selectOptions: vi.fn(async () => {}),
		};

		document.body.innerHTML = "<button>Go</button>";
		const locator = rtl(document.body, mockUser);
		await locator.getByRole("button", { name: "Go" }).click();

		expect(mockUser.click).toHaveBeenCalledOnce();
		expect(mockUser.click.mock.calls[0][0]).toBeInstanceOf(HTMLButtonElement);
	});

	it("fills inputs", async () => {
		document.body.innerHTML =
			'<label for="name">Name</label><input id="name" />';
		const locator = rtl(document.body);
		await locator.getByLabel("Name").fill("Alice");

		const input = document.getElementById("name") as HTMLInputElement;
		expect(input.value).toBe("Alice");
	});

	it("fills inputs using userEvent when provided", async () => {
		const mockUser = {
			click: vi.fn(async () => {}),
			type: vi.fn(async () => {}),
			clear: vi.fn(async () => {}),
			selectOptions: vi.fn(async () => {}),
		};

		document.body.innerHTML = '<label for="x">Name</label><input id="x" />';
		const locator = rtl(document.body, mockUser);
		await locator.getByLabel("Name").fill("Bob");

		expect(mockUser.clear).toHaveBeenCalledOnce();
		expect(mockUser.type).toHaveBeenCalledOnce();
		expect(mockUser.type.mock.calls[0][1]).toBe("Bob");
	});

	it("checks and unchecks checkboxes", async () => {
		document.body.innerHTML = '<label><input type="checkbox" />Accept</label>';
		const locator = rtl(document.body);
		const cb = locator.getByRole("checkbox");

		expect(await cb.isChecked()).toBe(false);
		await cb.check();
		expect(await cb.isChecked()).toBe(true);
		await cb.uncheck();
		expect(await cb.isChecked()).toBe(false);
	});

	it("chains locators for scoped queries", () => {
		document.body.innerHTML = `
			<div data-testid="section-a"><button>Save</button></div>
			<div data-testid="section-b"><button>Save</button></div>
		`;
		const locator = rtl(document.body);
		const sectionB = locator.getByTestId("section-b");
		const btn = sectionB.getByRole("button", { name: "Save" });
		expect(btn).toBeDefined();
	});
});

describe("rtl adapter + widget()", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("works end-to-end with a widget definition", async () => {
		document.body.innerHTML = `
			<form>
				<label for="email">Email</label>
				<input id="email" />
				<label for="pass">Password</label>
				<input id="pass" type="password" />
				<button type="submit">Sign in</button>
			</form>
		`;

		const loginForm = widget((l) => ({
			elements: {
				email: () => l.byLabel("Email"),
				password: () => l.byLabel("Password"),
				submit: () => l.button({ name: "Sign in" }),
			},
			actions: {
				login: async (email: string, password: string) => {
					await l.byLabel("Email").fill(email);
					await l.byLabel("Password").fill(password);
					await l.button({ name: "Sign in" }).click();
				},
			},
		}));

		const { elements, actions } = loginForm.from(rtl(document.body));

		// Elements are findable
		expect(await elements.email().textContent()).not.toBeNull();
		expect(await elements.submit().textContent()).toBe("Sign in");

		// Actions work
		await actions.login("user@test.com", "secret");
		const emailInput = document.getElementById("email") as HTMLInputElement;
		expect(emailInput.value).toBe("user@test.com");
	});

	it("supports role shortcuts in widget definitions", async () => {
		document.body.innerHTML = `
			<h1>Welcome</h1>
			<a href="/about">About</a>
			<input type="checkbox" aria-label="Accept terms" />
			<select aria-label="Country"><option value="fr">France</option></select>
		`;

		const page = widget((l) => ({
			elements: {
				title: () => l.heading({ name: "Welcome" }),
				about: () => l.link({ name: "About" }),
				terms: () => l.checkbox({ name: "Accept terms" }),
				country: () => l.combobox({ name: "Country" }),
			},
		}));

		const { elements } = page.from(rtl(document.body));

		expect(await elements.title().textContent()).toBe("Welcome");
		expect(await elements.about().getAttribute("href")).toBe("/about");
		expect(await elements.terms().isChecked()).toBe(false);
		expect(elements.country()).toBeDefined();
	});

	it("supports widget composition", async () => {
		document.body.innerHTML = `
			<div data-testid="header"><h1>My App</h1></div>
			<div data-testid="form"><button>Submit</button></div>
		`;

		const header = widget((l) => ({
			elements: { title: () => l.heading({ name: "My App" }) },
		}));

		const form = widget((l) => ({
			elements: { submit: () => l.button({ name: "Submit" }) },
		}));

		const appPage = widget((l) => ({
			widgets: {
				header: header.from(l),
				form: form.from(l),
			},
		}));

		const { widgets } = appPage.from(rtl(document.body));

		expect(await widgets.header.elements.title().textContent()).toBe("My App");
		expect(await widgets.form.elements.submit().textContent()).toBe("Submit");
	});
});
