import { afterEach, describe, expect, it } from "vitest";
import { rtl } from "../adapters/rtl.js";
import { widget } from "../widget.js";

function insertLater(
	html: string,
	delay = 100,
	parent: Element = document.body,
) {
	setTimeout(() => parent.insertAdjacentHTML("beforeend", html), delay);
}

describe("rtl adapter find() / findAll()", () => {
	afterEach(() => {
		document.body.innerHTML = "";
	});

	it("find() resolves immediately when the element is present", async () => {
		document.body.innerHTML = "<button>Save</button>";
		const el = await rtl(document.body).getByRole("button").find();
		expect(el).toHaveTextContent("Save");
	});

	it("find() waits for an element that appears later", async () => {
		const locator = rtl(document.body);
		insertLater("<p>Loaded</p>");
		expect(locator.getByText("Loaded").query()).toBeNull();
		const el = await locator.getByText("Loaded").find();
		expect(el).toHaveTextContent("Loaded");
	});

	it("find() rejects with a not-found error after the timeout", async () => {
		await expect(
			rtl(document.body)
				.getByRole("button", { name: "Nope" })
				.find({ timeout: 100 }),
		).rejects.toThrow(
			'Unable to find element with role "button" and name "Nope"',
		);
	});

	it("find() rejects when more than one element matches", async () => {
		document.body.innerHTML = "<button>A</button><button>B</button>";
		await expect(
			rtl(document.body).getByRole("button").find({ timeout: 100 }),
		).rejects.toThrow('Found multiple elements (2) with role "button"');
	});

	it("find() resolves once duplicates go away", async () => {
		document.body.innerHTML = '<p class="x">Hi</p><p>Hi</p>';
		setTimeout(() => document.querySelector(".x")?.remove(), 50);
		const el = await rtl(document.body).getByText("Hi").find();
		expect(el).toHaveTextContent("Hi");
	});

	it("chained find() waits for a parent that appears later", async () => {
		const section = rtl(document.body).getByTestId("section");
		insertLater('<div data-testid="section"><button>Go</button></div>');
		const el = await section.getByRole("button", { name: "Go" }).find();
		expect(el).toBeInstanceOf(HTMLButtonElement);
	});

	it("findAll() waits for at least one match and returns all", async () => {
		const locator = rtl(document.body);
		insertLater("<li>A</li><li>B</li>");
		const items = await locator.getByRole("listitem").findAll();
		expect(items).toHaveLength(2);
	});

	it("findAll() rejects when nothing matches", async () => {
		await expect(
			rtl(document.body).getByRole("listitem").findAll({ timeout: 100 }),
		).rejects.toThrow('Unable to find element with role "listitem"');
	});

	it("find() works through widget() enhanced locators", async () => {
		const w = widget((l) => ({
			elements: { done: l.heading({ name: "Done" }) },
		}));
		const { elements } = w.from(rtl(document.body));
		insertLater("<h2>Done</h2>");
		expect(await elements.done.find()).toHaveTextContent("Done");
		expect(await elements.done.findAll()).toHaveLength(1);
	});
});
