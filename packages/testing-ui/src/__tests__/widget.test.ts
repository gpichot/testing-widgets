import { describe, expect, it, vi } from "vitest";
import { asCallable } from "../callable.js";
import type { LocatorMethods } from "../types.js";
import { widget } from "../widget.js";

function mockLocator(overrides: Partial<LocatorMethods> = {}) {
	const base: LocatorMethods = {
		getByRole: vi.fn(() => mockLocator()),
		getByLabel: vi.fn(() => mockLocator()),
		getByPlaceholder: vi.fn(() => mockLocator()),
		getByText: vi.fn(() => mockLocator()),
		getByTestId: vi.fn(() => mockLocator()),
		click: vi.fn(async () => {}),
		fill: vi.fn(async () => {}),
		check: vi.fn(async () => {}),
		uncheck: vi.fn(async () => {}),
		selectOption: vi.fn(async () => {}),
		clear: vi.fn(async () => {}),
		textContent: vi.fn(async () => null),
		getAttribute: vi.fn(async () => null),
		inputValue: vi.fn(async () => ""),
		isVisible: vi.fn(async () => true),
		isEnabled: vi.fn(async () => true),
		isChecked: vi.fn(async () => false),
		get: vi.fn(() => null),
		getAll: vi.fn(() => []),
		query: vi.fn(() => null),
		queryAll: vi.fn(() => []),
		find: vi.fn(async () => null),
	};
	const loc = asCallable(Object.assign(base, overrides));
	return loc;
}

describe("widget()", () => {
	it("calls the factory with an enhanced locator and returns the result", () => {
		const w = widget((l) => ({
			elements: {
				submit: l.button({ name: "Go" }),
			},
		}));

		const loc = mockLocator();
		const { elements } = w.from(loc);

		elements.submit();
		expect(loc.getByRole).toHaveBeenCalledWith("button", { name: "Go" });
	});

	it("exposes short aliases (byRole, byLabel, byText, etc.)", () => {
		const w = widget((l) => ({
			elements: {
				a: l.byRole("link", { name: "Home" }),
				b: l.byLabel("Email"),
				c: l.byText("Hello"),
				d: l.byPlaceholder("Search"),
				e: l.byTestId("foo"),
			},
		}));

		const loc = mockLocator();
		w.from(loc);

		expect(loc.getByRole).toHaveBeenCalledWith("link", { name: "Home" });
		expect(loc.getByLabel).toHaveBeenCalledWith("Email");
		expect(loc.getByText).toHaveBeenCalledWith("Hello");
		expect(loc.getByPlaceholder).toHaveBeenCalledWith("Search");
		expect(loc.getByTestId).toHaveBeenCalledWith("foo");
	});

	it("supports actions that interact with elements", async () => {
		const childLoc = mockLocator();
		const loc = mockLocator({
			getByRole: vi.fn(() => childLoc),
		});

		const w = widget((l) => ({
			actions: {
				submit: () => l.button({ name: "Save" }).click(),
			},
		}));

		const { actions } = w.from(loc);
		await actions.submit();

		expect(loc.getByRole).toHaveBeenCalledWith("button", { name: "Save" });
		expect(childLoc.click).toHaveBeenCalled();
	});

	it("supports composing widgets", () => {
		const inner = widget((l) => ({
			elements: { title: l.heading({ name: "Section" }) },
		}));

		const outer = widget((l) => ({
			widgets: {
				section: inner.from(l),
			},
		}));

		const loc = mockLocator();
		const { widgets } = outer.from(loc);

		widgets.section.elements.title();
		expect(loc.getByRole).toHaveBeenCalledWith("heading", {
			name: "Section",
		});
	});
});
