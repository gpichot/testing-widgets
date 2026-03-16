/**
 * React Testing Library adapter.
 *
 * @example
 * ```ts
 * import { rtl } from "testing-ui/adapters/rtl";
 * import { render } from "@testing-library/react";
 * import userEvent from "@testing-library/user-event";
 *
 * const user = userEvent.setup();
 * const { container } = render(<MyComponent />);
 * const locator = rtl(container, user);
 * ```
 */

import type { ByRoleOptions, Locator } from "../types.js";

/** Minimal userEvent interface — avoids compile-time dep on @testing-library/user-event */
interface UserEventLike {
	click(element: Element): Promise<void>;
	type(element: Element, text: string, options?: object): Promise<void>;
	clear(element: Element): Promise<void>;
	selectOptions(
		element: Element,
		values: string | string[] | HTMLElement | HTMLElement[],
	): Promise<void>;
}

export function rtl(
	container: HTMLElement = document.body,
	user?: UserEventLike,
): Locator {
	return new RtlLocator(() => container, user);
}

// ---------------------------------------------------------------------------

type Query =
	| { kind: "role"; role: string; options?: ByRoleOptions }
	| { kind: "label"; text: string | RegExp }
	| { kind: "placeholder"; text: string | RegExp }
	| { kind: "text"; text: string | RegExp }
	| { kind: "testid"; id: string };

class RtlLocator implements Locator {
	constructor(
		private resolve: () => HTMLElement,
		private user?: UserEventLike,
	) {}

	// --- Queries (lazy) ---------------------------------------------------

	getByRole(role: string, options?: ByRoleOptions): Locator {
		return this.lazy({ kind: "role", role, options });
	}

	getByLabel(text: string | RegExp): Locator {
		return this.lazy({ kind: "label", text });
	}

	getByPlaceholder(text: string | RegExp): Locator {
		return this.lazy({ kind: "placeholder", text });
	}

	getByText(text: string | RegExp): Locator {
		return this.lazy({ kind: "text", text });
	}

	getByTestId(id: string): Locator {
		return this.lazy({ kind: "testid", id });
	}

	// --- Actions ----------------------------------------------------------

	async click(): Promise<void> {
		const el = this.resolve();
		if (this.user) return this.user.click(el);
		el.click();
	}

	async fill(value: string): Promise<void> {
		const el = this.resolve() as HTMLInputElement;
		if (this.user) {
			await this.user.clear(el);
			return this.user.type(el, value);
		}
		setNativeValue(el, value);
	}

	async check(): Promise<void> {
		const el = this.resolve() as HTMLInputElement;
		if (!el.checked) await this.click();
	}

	async uncheck(): Promise<void> {
		const el = this.resolve() as HTMLInputElement;
		if (el.checked) await this.click();
	}

	async selectOption(value: string | string[]): Promise<void> {
		const el = this.resolve() as HTMLSelectElement;
		if (this.user) return this.user.selectOptions(el, value);
		const values = Array.isArray(value) ? value : [value];
		for (const opt of Array.from(el.options)) {
			opt.selected = values.includes(opt.value);
		}
		el.dispatchEvent(new Event("change", { bubbles: true }));
	}

	async clear(): Promise<void> {
		const el = this.resolve() as HTMLInputElement;
		if (this.user) return this.user.clear(el);
		setNativeValue(el, "");
	}

	// --- State ------------------------------------------------------------

	async textContent(): Promise<string | null> {
		return this.resolve().textContent;
	}

	async getAttribute(name: string): Promise<string | null> {
		return this.resolve().getAttribute(name);
	}

	async inputValue(): Promise<string> {
		return (this.resolve() as HTMLInputElement).value;
	}

	async isVisible(): Promise<boolean> {
		const el = this.resolve();
		const style = window.getComputedStyle(el);
		return (
			style.display !== "none" &&
			style.visibility !== "hidden" &&
			style.opacity !== "0"
		);
	}

	async isEnabled(): Promise<boolean> {
		return !(this.resolve() as HTMLInputElement).disabled;
	}

	async isChecked(): Promise<boolean> {
		return (this.resolve() as HTMLInputElement).checked;
	}

	// --- Internal ---------------------------------------------------------

	private lazy(query: Query): Locator {
		return new RtlLocator(() => runQuery(this.resolve(), query), this.user);
	}
}

// ---------------------------------------------------------------------------
// Minimal DOM query helpers (no @testing-library/dom dependency)
// ---------------------------------------------------------------------------

function matches(actual: string, expected: string | RegExp): boolean {
	return typeof expected === "string"
		? actual === expected
		: expected.test(actual);
}

function runQuery(root: HTMLElement, q: Query): HTMLElement {
	switch (q.kind) {
		case "role":
			return findByRole(root, q.role, q.options);
		case "label":
			return findByLabel(root, q.text);
		case "placeholder":
			return findByAttr(root, "placeholder", q.text);
		case "text":
			return findByText(root, q.text);
		case "testid":
			return findByAttr(root, "data-testid", q.id);
	}
}

function findByRole(
	root: HTMLElement,
	role: string,
	options?: ByRoleOptions,
): HTMLElement {
	// Map common implicit roles to selectors
	const implicit: Record<string, string> = {
		button:
			'button, [role="button"], input[type="button"], input[type="submit"]',
		textbox:
			'input:not([type]), input[type="text"], textarea, [role="textbox"]',
		checkbox: 'input[type="checkbox"], [role="checkbox"]',
		radio: 'input[type="radio"], [role="radio"]',
		link: 'a[href], [role="link"]',
		heading: "h1, h2, h3, h4, h5, h6, [role=heading]",
		list: 'ul, ol, [role="list"]',
		listitem: 'li, [role="listitem"]',
		combobox: 'select, [role="combobox"]',
		dialog: 'dialog, [role="dialog"]',
		img: 'img[alt], [role="img"]',
	};
	const selector = implicit[role] ?? `[role="${role}"]`;

	for (const el of Array.from(root.querySelectorAll<HTMLElement>(selector))) {
		if (options?.name !== undefined) {
			const accessible =
				el.getAttribute("aria-label") ?? el.textContent?.trim() ?? "";
			if (!matches(accessible, options.name)) continue;
		}
		return el;
	}
	throw new Error(
		`Unable to find element with role "${role}"${options?.name ? ` and name "${options.name}"` : ""}`,
	);
}

function findByLabel(root: HTMLElement, text: string | RegExp): HTMLElement {
	for (const label of Array.from(root.querySelectorAll("label"))) {
		if (!matches(label.textContent?.trim() ?? "", text)) continue;
		const forId = label.getAttribute("for");
		if (forId) {
			const el = root.querySelector<HTMLElement>(`#${forId}`);
			if (el) return el;
		}
		const input = label.querySelector<HTMLElement>("input, select, textarea");
		if (input) return input;
	}
	for (const el of Array.from(root.querySelectorAll<HTMLElement>("*"))) {
		const aria = el.getAttribute("aria-label");
		if (aria && matches(aria, text)) return el;
	}
	throw new Error(`Unable to find element with label "${text}"`);
}

function findByText(root: HTMLElement, text: string | RegExp): HTMLElement {
	for (const el of Array.from(root.querySelectorAll<HTMLElement>("*"))) {
		if (el.children.length === 0 && matches(el.textContent?.trim() ?? "", text))
			return el;
	}
	throw new Error(`Unable to find element with text "${text}"`);
}

function findByAttr(
	root: HTMLElement,
	attr: string,
	value: string | RegExp,
): HTMLElement {
	for (const el of Array.from(
		root.querySelectorAll<HTMLElement>(`[${attr}]`),
	)) {
		if (matches(el.getAttribute(attr) ?? "", value)) return el;
	}
	throw new Error(`Unable to find element with ${attr} "${value}"`);
}

function setNativeValue(el: HTMLInputElement, value: string): void {
	const desc = Object.getOwnPropertyDescriptor(
		Object.getPrototypeOf(el),
		"value",
	);
	desc?.set?.call(el, value);
	el.dispatchEvent(new Event("input", { bubbles: true }));
	el.dispatchEvent(new Event("change", { bubbles: true }));
}
