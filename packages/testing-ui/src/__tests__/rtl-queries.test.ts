import { configure } from "@testing-library/dom";
import { afterEach, describe, expect, it } from "vitest";
import { rtl } from "../adapters/rtl.js";

function setup(html: string) {
	document.body.innerHTML = html;
	return rtl(document.body);
}

afterEach(() => {
	document.body.innerHTML = "";
});

describe("rtl adapter — RTL resolution semantics", () => {
	it("get() throws when more than one element matches (like getBy*)", () => {
		const l = setup("<button>A</button><button>B</button>");
		expect(() => l.getByRole("button").get()).toThrow(
			'Found multiple elements (2) with role "button"',
		);
		expect(() => l.getByRole("button")()).toThrow(/multiple elements/);
	});

	it("get() errors are TestingLibraryElementError with a DOM snapshot", () => {
		const l = setup('<p class="marker">hello</p>');
		try {
			l.getByRole("button").get();
			expect.unreachable();
		} catch (error) {
			expect((error as Error).name).toBe("TestingLibraryElementError");
			expect((error as Error).message).toContain("marker");
		}
	});

	it("query() returns null when none match and throws when several match (like queryBy*)", () => {
		const l = setup("<button>A</button><button>B</button>");
		expect(l.getByRole("link").query()).toBeNull();
		expect(() => l.getByRole("button").query()).toThrow(/multiple elements/);
	});

	it("query() returns null when a parent in the chain is missing", () => {
		const l = setup("<button>A</button>");
		expect(l.getByTestId("missing").getByRole("button").query()).toBeNull();
		expect(l.getByTestId("missing").getByRole("button").queryAll()).toEqual([]);
	});

	it("query() surfaces an ambiguous parent instead of returning null", () => {
		const l = setup(
			'<div data-testid="s"><button>A</button></div><div data-testid="s"></div>',
		);
		expect(() => l.getByTestId("s").getByRole("button").query()).toThrow(
			/multiple elements \(2\) with data-testid "s"/,
		);
	});

	it("getAll() throws when nothing matches (like getAllBy*)", () => {
		const l = setup("<p>x</p>");
		expect(() => l.getByRole("button").getAll()).toThrow(
			'Unable to find element with role "button"',
		);
	});

	it("actions throw on ambiguous matches instead of acting on the first one", async () => {
		const l = setup("<button>A</button><button>B</button>");
		await expect(l.getByRole("button").click()).rejects.toThrow(
			/multiple elements/,
		);
	});
});

describe("rtl adapter — accessible names", () => {
	it("computes names from aria-labelledby", () => {
		const l = setup(
			'<span id="t">Billing</span><section aria-labelledby="t">x</section>',
		);
		expect(l.getByRole("region", { name: "Billing" })()).toHaveTextContent("x");
	});

	it("computes img names from alt", () => {
		const l = setup('<img alt="Company logo" src="a.png" />');
		expect(l.getByRole("img", { name: "Company logo" })()).toBeInstanceOf(
			HTMLImageElement,
		);
	});

	it("computes button names from nested content", () => {
		const l = setup("<button><span>Save</span> <b>draft</b></button>");
		expect(l.getByRole("button", { name: "Save draft" })()).toBeInstanceOf(
			HTMLButtonElement,
		);
	});

	it("excludes hidden elements from role queries", () => {
		const l = setup(`
			<button style="display:none">Hidden</button>
			<div hidden><button>Hidden too</button></div>
			<button aria-hidden="true">Aria hidden</button>
			<button>Visible</button>
		`);
		const names = l
			.getByRole("button")
			.getAll()
			.map((b) => b.textContent);
		expect(names).toEqual(["Visible"]);
	});

	it("supports implicit roles the old engine lacked", () => {
		const l = setup(`
			<nav aria-label="Main"></nav>
			<table><tbody><tr><td>cell</td></tr></tbody></table>
			<input type="email" aria-label="Email" />
		`);
		expect(l.getByRole("navigation", { name: "Main" })()).toBeTruthy();
		expect(l.getByRole("cell")()).toHaveTextContent("cell");
		expect(l.getByRole("textbox", { name: "Email" })()).toBeTruthy();
	});
});

describe("rtl adapter — ByRoleOptions filters", () => {
	it("filters by checked", () => {
		const l = setup(`
			<input type="checkbox" aria-label="A" checked />
			<input type="checkbox" aria-label="B" />
		`);
		expect(l.getByRole("checkbox", { checked: true })()).toHaveAccessibleName(
			"A",
		);
		expect(l.getByRole("checkbox", { checked: false })()).toHaveAccessibleName(
			"B",
		);
	});

	it("filters by disabled (native and aria-disabled)", () => {
		const l = setup(`
			<button disabled>Native</button>
			<div aria-disabled="true"><button>Aria</button></div>
			<button>Enabled</button>
		`);
		const disabled = l.getByRole("button", { disabled: true }).getAll();
		expect(disabled.map((b) => b.textContent)).toEqual(["Native", "Aria"]);
		expect(l.getByRole("button", { disabled: false })()).toHaveTextContent(
			"Enabled",
		);
	});

	it("filters by expanded", () => {
		const l = setup(`
			<button aria-expanded="true">Open</button>
			<button aria-expanded="false">Closed</button>
		`);
		expect(l.getByRole("button", { expanded: true })()).toHaveTextContent(
			"Open",
		);
		expect(l.getByRole("button", { expanded: false })()).toHaveTextContent(
			"Closed",
		);
	});

	it("filters by selected", () => {
		const l = setup(`
			<div role="tablist">
				<button role="tab" aria-selected="true">One</button>
				<button role="tab" aria-selected="false">Two</button>
			</div>
		`);
		expect(l.getByRole("tab", { selected: true })()).toHaveTextContent("One");
	});

	it("filters by pressed", () => {
		const l = setup(`
			<button aria-pressed="true">Bold</button>
			<button aria-pressed="false">Italic</button>
		`);
		expect(l.getByRole("button", { pressed: true })()).toHaveTextContent(
			"Bold",
		);
	});

	it("combines name and state filters", () => {
		const l = setup(`
			<input type="checkbox" aria-label="Terms" />
			<input type="checkbox" aria-label="News" checked />
		`);
		expect(
			l.getByRole("checkbox", { name: "Terms", checked: true }).query(),
		).toBeNull();
		expect(
			l.getByRole("checkbox", { name: "News", checked: true }).query(),
		).not.toBeNull();
	});

	it("describes state filters in not-found errors", () => {
		const l = setup("<button>Go</button>");
		expect(() =>
			l.getByRole("button", { name: "Go", pressed: true }).get(),
		).toThrow(
			'Unable to find element with role "button" and name "Go" and pressed=true',
		);
	});
});

describe("rtl adapter — text, label, placeholder, test id", () => {
	it("byText matches elements whose own text matches, not just leaves", () => {
		const l = setup("<div>Total: <span>3</span></div>");
		expect(l.getByText("Total:")()).toBeInstanceOf(HTMLDivElement);
		expect(l.getByText("3")()).toBeInstanceOf(HTMLSpanElement);
	});

	it("byText normalizes whitespace", () => {
		const l = setup("<p>  Hello \n   world  </p>");
		expect(l.getByText("Hello world")()).toBeInstanceOf(HTMLParagraphElement);
	});

	it("byText is exact for strings and flexible for RegExp", () => {
		const l = setup("<p>Form submitted successfully</p>");
		expect(l.getByText("submitted").query()).toBeNull();
		expect(l.getByText(/submitted/i)()).toBeInstanceOf(HTMLParagraphElement);
	});

	it("byLabel resolves for= with characters that need CSS escaping", () => {
		const l = setup(
			'<label for="user.email">Email</label><input id="user.email" />',
		);
		expect(l.getByLabel("Email")()).toHaveAttribute("id", "user.email");
	});

	it("byLabel resolves wrapping labels, aria-label and aria-labelledby", () => {
		const l = setup(`
			<label>Wrapped <input id="w" /></label>
			<input id="a" aria-label="Direct" />
			<span id="lbl">Referenced</span><input id="r" aria-labelledby="lbl" />
		`);
		expect(l.getByLabel("Wrapped")()).toHaveAttribute("id", "w");
		expect(l.getByLabel("Direct")()).toHaveAttribute("id", "a");
		expect(l.getByLabel("Referenced")()).toHaveAttribute("id", "r");
	});

	it("byPlaceholder matches placeholder attribute", () => {
		const l = setup('<input placeholder="Search…" />');
		expect(l.getByPlaceholder(/search/i)()).toBeInstanceOf(HTMLInputElement);
	});

	it("byTestId honours configure({ testIdAttribute })", () => {
		configure({ testIdAttribute: "data-qa" });
		try {
			const l = setup(
				'<div data-qa="panel">p</div><div data-testid="panel">t</div>',
			);
			expect(l.getByTestId("panel")()).toHaveTextContent("p");
			expect(() => l.getByTestId("nope")()).toThrow('data-qa "nope"');
		} finally {
			configure({ testIdAttribute: "data-testid" });
		}
	});
});

describe("rtl adapter — state helpers", () => {
	it("isEnabled() honours aria-disabled", async () => {
		const l = setup('<div aria-disabled="true"><button>Go</button></div>');
		expect(await l.getByRole("button").isEnabled()).toBe(false);
	});

	it("isChecked() honours aria-checked on custom checkboxes", async () => {
		const l = setup(
			'<div role="checkbox" aria-checked="true" aria-label="X"></div>',
		);
		expect(await l.getByRole("checkbox").isChecked()).toBe(true);
	});
});
