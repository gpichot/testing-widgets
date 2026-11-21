import { describe, expect, it } from "vitest";
import { type PwLocatable, playwright } from "../adapters/playwright.js";
import { widget } from "../widget.js";

/**
 * In-memory stand-in for a Playwright Locator/Page. Each query returns a child
 * fake and records the call, so tests can assert on the resulting chain.
 */
class FakeLocator implements PwLocatable {
	readonly calls: Array<[string, ...unknown[]]> = [];

	constructor(
		readonly path: string[] = [],
		private children: FakeLocator[] = [],
	) {}

	private child(desc: string) {
		return new FakeLocator([...this.path, desc]);
	}
	private record<R>(name: string, args: unknown[], result: R): R {
		this.calls.push([name, ...args]);
		return result;
	}

	getByRole(role: string, options?: object) {
		return this.record(
			"getByRole",
			[role, options],
			this.child(`role=${role}`),
		);
	}
	getByLabel(text: string | RegExp) {
		return this.record("getByLabel", [text], this.child(`label=${text}`));
	}
	getByPlaceholder(text: string | RegExp) {
		return this.record(
			"getByPlaceholder",
			[text],
			this.child(`placeholder=${text}`),
		);
	}
	getByText(text: string | RegExp) {
		return this.record("getByText", [text], this.child(`text=${text}`));
	}
	getByTestId(id: string) {
		return this.record("getByTestId", [id], this.child(`testid=${id}`));
	}

	async click() {
		this.record("click", [], undefined);
	}
	async fill(value: string) {
		this.record("fill", [value], undefined);
	}
	async check() {
		this.record("check", [], undefined);
	}
	async uncheck() {
		this.record("uncheck", [], undefined);
	}
	async selectOption(value: string | string[]) {
		return this.record("selectOption", [value], [value].flat());
	}
	async clear() {
		this.record("clear", [], undefined);
	}
	async textContent() {
		return this.record("textContent", [], "text");
	}
	async getAttribute(name: string) {
		return this.record("getAttribute", [name], `attr:${name}`);
	}
	async inputValue() {
		return this.record("inputValue", [], "value");
	}
	async isVisible() {
		return this.record("isVisible", [], true);
	}
	async isEnabled() {
		return this.record("isEnabled", [], false);
	}
	async isChecked() {
		return this.record("isChecked", [], true);
	}
	async all() {
		return this.record("all", [], this.children);
	}
}

describe("playwright adapter — queries", () => {
	it("forwards getBy* calls to the page", () => {
		const page = new FakeLocator();
		const l = playwright(page);

		expect(l.getByLabel("Email").get().path).toEqual(["label=Email"]);
		expect(l.getByPlaceholder("Search").get().path).toEqual([
			"placeholder=Search",
		]);
		expect(l.getByText(/hi/).get().path).toEqual(["text=/hi/"]);
		expect(l.getByTestId("x").get().path).toEqual(["testid=x"]);
		expect(page.calls.map((c) => c[0])).toEqual([
			"getByLabel",
			"getByPlaceholder",
			"getByText",
			"getByTestId",
		]);
	});

	it("forwards every ByRoleOptions field to getByRole", () => {
		const page = new FakeLocator();
		playwright(page).getByRole("button", {
			name: "Save",
			checked: true,
			disabled: false,
			expanded: true,
			selected: false,
			pressed: true,
		});
		expect(page.calls[0]).toEqual([
			"getByRole",
			"button",
			{
				name: "Save",
				checked: true,
				disabled: false,
				expanded: true,
				selected: false,
				pressed: true,
			},
		]);
	});

	it("omits undefined role options and passes undefined when none given", () => {
		const page = new FakeLocator();
		const l = playwright(page);
		l.getByRole("checkbox", { name: undefined, checked: true });
		l.getByRole("link");
		expect(page.calls[0]).toEqual(["getByRole", "checkbox", { checked: true }]);
		expect(page.calls[1]).toEqual(["getByRole", "link", undefined]);
	});

	it("chains queries on the returned locator", () => {
		const page = new FakeLocator();
		const button = playwright(page)
			.getByTestId("form")
			.getByRole("button", { name: "Send" });
		expect(button.get().path).toEqual(["testid=form", "role=button"]);
	});
});

describe("playwright adapter — resolution", () => {
	it("get(), query(), callable and find() return the native locator", async () => {
		const page = new FakeLocator();
		const loc = playwright(page).getByRole("heading");
		const native = loc.get();
		expect(native).toBeInstanceOf(FakeLocator);
		expect(loc.query()).toBe(native);
		expect(loc()).toBe(native);
		expect(await loc.find()).toBe(native);
	});

	it("findAll() resolves to locator.all()", async () => {
		const items = [new FakeLocator(["a"]), new FakeLocator(["b"])];
		const root = new FakeLocator([], items);
		expect(await playwright(root).findAll()).toBe(items);
		expect(root.calls).toEqual([["all"]]);
	});

	it("getAll() and queryAll() throw with guidance", () => {
		const l = playwright(new FakeLocator()).getByRole("row");
		expect(() => l.getAll()).toThrow(/Playwright getAll\(\) is async/);
		expect(() => l.queryAll()).toThrow(/Playwright queryAll\(\) is async/);
	});
});

describe("playwright adapter — actions and state", () => {
	it("delegates actions to the native locator", async () => {
		const page = new FakeLocator();
		const l = playwright(page).getByLabel("Name");
		const native = l.get();

		await l.click();
		await l.fill("Alice");
		await l.check();
		await l.uncheck();
		await l.clear();
		const selected = await l.selectOption(["a", "b"]);

		expect(selected).toBeUndefined();
		expect(native.calls).toEqual([
			["click"],
			["fill", "Alice"],
			["check"],
			["uncheck"],
			["clear"],
			["selectOption", ["a", "b"]],
		]);
	});

	it("delegates state reads to the native locator", async () => {
		const l = playwright(new FakeLocator()).getByRole("checkbox");
		expect(await l.textContent()).toBe("text");
		expect(await l.getAttribute("href")).toBe("attr:href");
		expect(await l.inputValue()).toBe("value");
		expect(await l.isVisible()).toBe(true);
		expect(await l.isEnabled()).toBe(false);
		expect(await l.isChecked()).toBe(true);
	});
});

describe("playwright adapter + widget()", () => {
	it("maps role shortcuts and aliases to Playwright queries", async () => {
		const page = new FakeLocator();
		const form = widget((l) => ({
			elements: {
				terms: l.checkbox({ name: "Terms", checked: false }),
				tab: l.tab({ name: "Two", selected: true }),
				email: l.byLabel("Email"),
			},
			actions: {
				send: () => l.button({ name: "Send" }).click(),
			},
		}));

		const { elements, actions } = form.from(playwright(page));
		await actions.send();

		expect(elements.terms().path).toEqual(["role=checkbox"]);
		expect(elements.email().path).toEqual(["label=Email"]);
		expect(page.calls).toEqual([
			["getByRole", "checkbox", { name: "Terms", checked: false }],
			["getByRole", "tab", { name: "Two", selected: true }],
			["getByLabel", "Email"],
			["getByRole", "button", { name: "Send" }],
		]);
	});
});
