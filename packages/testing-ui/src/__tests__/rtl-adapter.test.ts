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
		expect(locator.getByRole("button", { name: "Save" })()).toBeVisible();
	});

	it("queries elements by label", () => {
		document.body.innerHTML =
			'<label for="email">Email</label><input id="email" />';
		const locator = rtl(document.body);
		expect(locator.getByLabel("Email")()).toBeVisible();
	});

	it("queries elements by text", () => {
		document.body.innerHTML = "<p>Hello world</p>";
		const locator = rtl(document.body);
		expect(locator.getByText("Hello world")()).toHaveTextContent("Hello world");
	});

	it("queries elements by placeholder", () => {
		document.body.innerHTML = '<input placeholder="Search..." />';
		const locator = rtl(document.body);
		expect(locator.getByPlaceholder("Search...")()).toBeVisible();
	});

	it("queries elements by test id", () => {
		document.body.innerHTML = '<div data-testid="my-el">content</div>';
		const locator = rtl(document.body);
		expect(locator.getByTestId("my-el")()).toHaveTextContent("content");
	});

	it("queries with regex", () => {
		document.body.innerHTML = "<button>Submit form</button>";
		const locator = rtl(document.body);
		expect(locator.getByRole("button", { name: /submit/i })()).toBeVisible();
	});

	it("returns null with query() when element is not found", () => {
		document.body.innerHTML = "";
		const locator = rtl(document.body);
		expect(locator.getByRole("button").query()).toBeNull();
	});

	it("throws with get() when element is not found", () => {
		document.body.innerHTML = "";
		const locator = rtl(document.body);
		expect(() => locator.getByRole("button").get()).toThrow(
			'Unable to find element with role "button"',
		);
	});

	it("returns all matching elements with getAll()", () => {
		document.body.innerHTML =
			"<button>A</button><button>B</button><button>C</button>";
		const locator = rtl(document.body);
		const buttons = locator.getByRole("button").getAll();
		expect(buttons).toHaveLength(3);
	});

	it("returns empty array with queryAll() when none found", () => {
		document.body.innerHTML = "";
		const locator = rtl(document.body);
		expect(locator.getByRole("button").queryAll()).toEqual([]);
	});

	it("calling locator() is shorthand for get()", () => {
		document.body.innerHTML = "<p>Hello</p>";
		const locator = rtl(document.body);
		const el = locator.getByText("Hello")();
		expect(el).toBeInstanceOf(HTMLElement);
		expect(el).toHaveTextContent("Hello");
	});

	it("reads attributes", () => {
		document.body.innerHTML = '<a href="/home">Home</a>';
		const link = rtl(document.body).getByRole("link", { name: "Home" })();
		expect(link).toHaveAttribute("href", "/home");
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
			click: vi.fn(async (_el: Element) => {}),
			type: vi.fn(async (_el: Element, _text: string) => {}),
			clear: vi.fn(async (_el: Element) => {}),
			selectOptions: vi.fn(
				async (
					_el: Element,
					_values: string | string[] | HTMLElement | HTMLElement[],
				) => {},
			),
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

		expect(locator.getByLabel("Name")()).toHaveValue("Alice");
	});

	it("fills inputs using userEvent when provided", async () => {
		const mockUser = {
			click: vi.fn(async (_el: Element) => {}),
			type: vi.fn(async (_el: Element, _text: string) => {}),
			clear: vi.fn(async (_el: Element) => {}),
			selectOptions: vi.fn(
				async (
					_el: Element,
					_values: string | string[] | HTMLElement | HTMLElement[],
				) => {},
			),
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

		expect(cb()).not.toBeChecked();
		await cb.check();
		expect(cb()).toBeChecked();
		await cb.uncheck();
		expect(cb()).not.toBeChecked();
	});

	it("chains locators for scoped queries", () => {
		document.body.innerHTML = `
			<div data-testid="section-a"><button>Save</button></div>
			<div data-testid="section-b"><button>Save</button></div>
		`;
		const locator = rtl(document.body);
		const sectionB = locator.getByTestId("section-b");
		expect(sectionB.getByRole("button", { name: "Save" })()).toBeVisible();
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
				email: l.byLabel("Email"),
				password: l.byLabel("Password"),
				submit: l.button({ name: "Sign in" }),
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

		expect(elements.email()).toBeVisible();
		expect(elements.submit()).toHaveTextContent("Sign in");

		await actions.login("user@test.com", "secret");
		expect(elements.email()).toHaveValue("user@test.com");
	});

	it("supports role shortcuts in widget definitions", () => {
		document.body.innerHTML = `
			<h1>Welcome</h1>
			<a href="/about">About</a>
			<input type="checkbox" aria-label="Accept terms" />
			<select aria-label="Country"><option value="fr">France</option></select>
		`;

		const page = widget((l) => ({
			elements: {
				title: l.heading({ name: "Welcome" }),
				about: l.link({ name: "About" }),
				terms: l.checkbox({ name: "Accept terms" }),
				country: l.combobox({ name: "Country" }),
			},
		}));

		const { elements } = page.from(rtl(document.body));

		expect(elements.title()).toHaveTextContent("Welcome");
		expect(elements.about()).toHaveAttribute("href", "/about");
		expect(elements.terms()).not.toBeChecked();
		expect(elements.country()).toBeVisible();
	});

	it("supports widget composition", () => {
		document.body.innerHTML = `
			<div data-testid="header"><h1>My App</h1></div>
			<div data-testid="form"><button>Submit</button></div>
		`;

		const header = widget((l) => ({
			elements: { title: l.heading({ name: "My App" }) },
		}));

		const form = widget((l) => ({
			elements: { submit: l.button({ name: "Submit" }) },
		}));

		const appPage = widget((l) => ({
			widgets: {
				header: header.from(l),
				form: form.from(l),
			},
		}));

		const { widgets } = appPage.from(rtl(document.body));

		expect(widgets.header.elements.title()).toHaveTextContent("My App");
		expect(widgets.form.elements.submit()).toHaveTextContent("Submit");
	});
});
