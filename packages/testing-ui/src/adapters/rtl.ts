/**
 * React Testing Library adapter for the Widget Object Model.
 *
 * This adapter bridges the Locator/Screen interfaces to RTL queries.
 * Usage:
 *
 * ```ts
 * import { createScreen } from "testing-ui/adapters/rtl";
 * import { render } from "@testing-library/react";
 *
 * const { container } = render(<MyComponent />);
 * const screen = createScreen(container);
 * ```
 */

import type {
	CreateScreen,
	GetByRoleOptions,
	Locator,
	Screen,
} from "../types.js";

export const createScreen: CreateScreen<HTMLElement> = (
	container: HTMLElement,
): Screen => {
	return new RTLLocator(container);
};

class RTLLocator implements Locator {
	constructor(private element: HTMLElement) {}

	getByRole(role: string, options?: GetByRoleOptions): Locator {
		// Lazy resolution: the actual query runs when an action is performed.
		// This allows chaining locators without immediate DOM access.
		return new RTLLazyLocator(this.element, { type: "role", role, options });
	}

	getByLabel(text: string | RegExp): Locator {
		return new RTLLazyLocator(this.element, { type: "label", text });
	}

	getByPlaceholder(text: string | RegExp): Locator {
		return new RTLLazyLocator(this.element, { type: "placeholder", text });
	}

	getByText(text: string | RegExp): Locator {
		return new RTLLazyLocator(this.element, { type: "text", text });
	}

	getByTestId(testId: string): Locator {
		return new RTLLazyLocator(this.element, { type: "testid", testId });
	}

	async click(): Promise<void> {
		this.element.click();
	}

	async fill(value: string): Promise<void> {
		setNativeValue(this.element as HTMLInputElement, value);
	}

	async check(): Promise<void> {
		const input = this.element as HTMLInputElement;
		if (!input.checked) input.click();
	}

	async uncheck(): Promise<void> {
		const input = this.element as HTMLInputElement;
		if (input.checked) input.click();
	}

	async selectOption(value: string | string[]): Promise<void> {
		const select = this.element as HTMLSelectElement;
		const values = Array.isArray(value) ? value : [value];
		for (const option of Array.from(select.options)) {
			option.selected = values.includes(option.value);
		}
		select.dispatchEvent(new Event("change", { bubbles: true }));
	}

	async textContent(): Promise<string | null> {
		return this.element.textContent;
	}

	async getAttribute(name: string): Promise<string | null> {
		return this.element.getAttribute(name);
	}

	async inputValue(): Promise<string> {
		return (this.element as HTMLInputElement).value;
	}

	async isVisible(): Promise<boolean> {
		return this.element.offsetParent !== null;
	}

	async isEnabled(): Promise<boolean> {
		return !(this.element as HTMLInputElement).disabled;
	}

	async isChecked(): Promise<boolean> {
		return (this.element as HTMLInputElement).checked;
	}
}

type LazyQuery =
	| { type: "role"; role: string; options?: GetByRoleOptions }
	| { type: "label"; text: string | RegExp }
	| { type: "placeholder"; text: string | RegExp }
	| { type: "text"; text: string | RegExp }
	| { type: "testid"; testId: string };

class RTLLazyLocator implements Locator {
	constructor(
		private root: HTMLElement,
		private query: LazyQuery,
	) {}

	private resolve(): HTMLElement {
		switch (this.query.type) {
			case "role":
				return queryByRole(this.root, this.query.role, this.query.options);
			case "label":
				return queryByLabel(this.root, this.query.text);
			case "placeholder":
				return queryByPlaceholder(this.root, this.query.text);
			case "text":
				return queryByText(this.root, this.query.text);
			case "testid":
				return queryByTestId(this.root, this.query.testId);
		}
	}

	getByRole(role: string, options?: GetByRoleOptions): Locator {
		return new RTLLazyLocator(this.resolve(), { type: "role", role, options });
	}

	getByLabel(text: string | RegExp): Locator {
		return new RTLLazyLocator(this.resolve(), { type: "label", text });
	}

	getByPlaceholder(text: string | RegExp): Locator {
		return new RTLLazyLocator(this.resolve(), { type: "placeholder", text });
	}

	getByText(text: string | RegExp): Locator {
		return new RTLLazyLocator(this.resolve(), { type: "text", text });
	}

	getByTestId(testId: string): Locator {
		return new RTLLazyLocator(this.resolve(), { type: "testid", testId });
	}

	async click(): Promise<void> {
		this.resolve().click();
	}

	async fill(value: string): Promise<void> {
		setNativeValue(this.resolve() as HTMLInputElement, value);
	}

	async check(): Promise<void> {
		const input = this.resolve() as HTMLInputElement;
		if (!input.checked) input.click();
	}

	async uncheck(): Promise<void> {
		const input = this.resolve() as HTMLInputElement;
		if (input.checked) input.click();
	}

	async selectOption(value: string | string[]): Promise<void> {
		const select = this.resolve() as HTMLSelectElement;
		const values = Array.isArray(value) ? value : [value];
		for (const option of Array.from(select.options)) {
			option.selected = values.includes(option.value);
		}
		select.dispatchEvent(new Event("change", { bubbles: true }));
	}

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
		return this.resolve().offsetParent !== null;
	}

	async isEnabled(): Promise<boolean> {
		return !(this.resolve() as HTMLInputElement).disabled;
	}

	async isChecked(): Promise<boolean> {
		return (this.resolve() as HTMLInputElement).checked;
	}
}

// --- Minimal DOM query helpers (no dependency on @testing-library/dom) ---

function matches(text: string, pattern: string | RegExp): boolean {
	if (typeof pattern === "string") return text === pattern;
	return pattern.test(text);
}

function queryByRole(
	root: HTMLElement,
	role: string,
	options?: GetByRoleOptions,
): HTMLElement {
	const selector =
		role === "button"
			? 'button, [role="button"], input[type="button"], input[type="submit"]'
			: `[role="${role}"], ${role}`;
	const candidates = Array.from(root.querySelectorAll<HTMLElement>(selector));

	for (const el of candidates) {
		if (
			options?.name !== undefined &&
			!matches(
				el.getAttribute("aria-label") || el.textContent?.trim() || "",
				options.name,
			)
		) {
			continue;
		}
		return el;
	}
	throw new Error(
		`Unable to find element with role "${role}"${options?.name ? ` and name "${options.name}"` : ""}`,
	);
}

function queryByLabel(root: HTMLElement, text: string | RegExp): HTMLElement {
	for (const label of Array.from(root.querySelectorAll("label"))) {
		if (matches(label.textContent?.trim() || "", text)) {
			const forAttr = label.getAttribute("for");
			if (forAttr) {
				const el = root.querySelector<HTMLElement>(`#${forAttr}`);
				if (el) return el;
			}
			const input = label.querySelector<HTMLElement>("input, select, textarea");
			if (input) return input;
		}
	}
	// Also check aria-label
	for (const el of Array.from(root.querySelectorAll<HTMLElement>("*"))) {
		const ariaLabel = el.getAttribute("aria-label");
		if (ariaLabel && matches(ariaLabel, text)) return el;
	}
	throw new Error(`Unable to find element with label "${text}"`);
}

function queryByPlaceholder(
	root: HTMLElement,
	text: string | RegExp,
): HTMLElement {
	for (const el of Array.from(
		root.querySelectorAll<HTMLElement>("[placeholder]"),
	)) {
		if (matches(el.getAttribute("placeholder") || "", text)) return el;
	}
	throw new Error(`Unable to find element with placeholder "${text}"`);
}

function queryByText(root: HTMLElement, text: string | RegExp): HTMLElement {
	for (const el of Array.from(root.querySelectorAll<HTMLElement>("*"))) {
		if (
			el.children.length === 0 &&
			matches(el.textContent?.trim() || "", text)
		) {
			return el;
		}
	}
	throw new Error(`Unable to find element with text "${text}"`);
}

function queryByTestId(root: HTMLElement, testId: string): HTMLElement {
	const el = root.querySelector<HTMLElement>(`[data-testid="${testId}"]`);
	if (!el) throw new Error(`Unable to find element with test id "${testId}"`);
	return el;
}

function setNativeValue(el: HTMLInputElement, value: string): void {
	const proto = Object.getPrototypeOf(el);
	const descriptor = Object.getOwnPropertyDescriptor(proto, "value");
	descriptor?.set?.call(el, value);
	el.dispatchEvent(new Event("input", { bubbles: true }));
	el.dispatchEvent(new Event("change", { bubbles: true }));
}
