/**
 * React Testing Library adapter.
 *
 * Queries are delegated to `@testing-library/dom` (`queryAllBy*`), so role,
 * accessible-name, label and text matching behave exactly like RTL.
 * Resolution follows RTL semantics:
 *
 * | method      | RTL equivalent | none   | many   |
 * | ----------- | -------------- | ------ | ------ |
 * | `get()`     | `getBy*`       | throws | throws |
 * | `getAll()`  | `getAllBy*`    | throws | ok     |
 * | `query()`   | `queryBy*`     | null   | throws |
 * | `queryAll()`| `queryAllBy*`  | []     | ok     |
 * | `find()`    | `findBy*`      | waits, then rejects | waits, then rejects |
 * | `findAll()` | `findAllBy*`   | waits, then rejects | ok |
 *
 * @example
 * ```ts
 * import { rtl } from "testing-widgets/adapters/rtl";
 * import { render } from "@testing-library/react";
 * import userEvent from "@testing-library/user-event";
 *
 * const user = userEvent.setup();
 * const { container } = render(<MyComponent />);
 * const locator = rtl(container, user);
 * ```
 */

import {
	type ByRoleOptions as DomByRoleOptions,
	getConfig,
	queryAllByLabelText,
	queryAllByPlaceholderText,
	queryAllByRole,
	queryAllByTestId,
	queryAllByText,
	waitFor,
} from "@testing-library/dom";
import { asCallable } from "../callable.js";
import type {
	ByRoleOptions,
	FindOptions,
	Locator,
	LocatorMethods,
} from "../types.js";

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
): Locator<HTMLElement> {
	return asCallable(new RtlLocator(container, () => [container], user));
}

// ---------------------------------------------------------------------------

type Query =
	| { kind: "role"; role: string; options?: ByRoleOptions }
	| { kind: "label"; text: string | RegExp }
	| { kind: "placeholder"; text: string | RegExp }
	| { kind: "text"; text: string | RegExp }
	| { kind: "testid"; id: string };

/** Thrown internally; converted to a TestingLibraryElementError at the API boundary. */
class QueryError extends Error {
	constructor(
		message: string,
		readonly reason: "not-found" | "multiple",
	) {
		super(message);
	}
}

class RtlLocator implements LocatorMethods<HTMLElement> {
	/**
	 * @param container - root passed to `rtl()`, used for error output.
	 * @param candidates - returns every element matching this locator's chain.
	 *   Parents in the chain are resolved strictly (exactly one), like
	 *   `within(getBy*(...))`.
	 */
	constructor(
		private container: HTMLElement,
		private candidates: () => HTMLElement[],
		private user?: UserEventLike,
		private description = "container",
	) {}

	// --- Queries (lazy) ---------------------------------------------------

	getByRole(role: string, options?: ByRoleOptions): Locator<HTMLElement> {
		return this.lazy({ kind: "role", role, options });
	}

	getByLabel(text: string | RegExp): Locator<HTMLElement> {
		return this.lazy({ kind: "label", text });
	}

	getByPlaceholder(text: string | RegExp): Locator<HTMLElement> {
		return this.lazy({ kind: "placeholder", text });
	}

	getByText(text: string | RegExp): Locator<HTMLElement> {
		return this.lazy({ kind: "text", text });
	}

	getByTestId(id: string): Locator<HTMLElement> {
		return this.lazy({ kind: "testid", id });
	}

	// --- Resolution -------------------------------------------------------

	get(): HTMLElement {
		return this.sync(() => this.strict());
	}

	getAll(): HTMLElement[] {
		return this.sync(() => this.atLeastOne());
	}

	query(): HTMLElement | null {
		return this.sync(() => {
			const results = this.candidatesOrEmpty();
			if (results.length > 1) this.throwMultiple(results.length);
			return results[0] ?? null;
		});
	}

	queryAll(): HTMLElement[] {
		return this.sync(() => this.candidatesOrEmpty());
	}

	find(options?: FindOptions): Promise<HTMLElement> {
		return this.wait(() => this.strict(), options);
	}

	findAll(options?: FindOptions): Promise<HTMLElement[]> {
		return this.wait(() => this.atLeastOne(), options);
	}

	// --- Actions ----------------------------------------------------------

	async click(): Promise<void> {
		const el = this.get();
		if (this.user) return this.user.click(el);
		el.click();
	}

	async fill(value: string): Promise<void> {
		const el = this.get();
		if (this.user) {
			await this.user.clear(el);
			return this.user.type(el, value);
		}
		setNativeValue(el, value);
	}

	async check(): Promise<void> {
		const el = this.get();
		if (el instanceof HTMLInputElement && !el.checked) {
			await this.click();
		}
	}

	async uncheck(): Promise<void> {
		const el = this.get();
		if (el instanceof HTMLInputElement && el.checked) {
			await this.click();
		}
	}

	async selectOption(value: string | string[]): Promise<void> {
		const el = this.get();
		if (!(el instanceof HTMLSelectElement)) {
			throw new TypeError(
				`selectOption requires a <select> element, got <${el.tagName.toLowerCase()}>`,
			);
		}
		if (this.user) return this.user.selectOptions(el, value);
		const values = Array.isArray(value) ? value : [value];
		for (const opt of Array.from(el.options)) {
			opt.selected = values.includes(opt.value);
		}
		el.dispatchEvent(new Event("change", { bubbles: true }));
	}

	async clear(): Promise<void> {
		const el = this.get();
		if (this.user) return this.user.clear(el);
		setNativeValue(el, "");
	}

	// --- State ------------------------------------------------------------

	async textContent(): Promise<string | null> {
		return this.get().textContent;
	}

	async getAttribute(name: string): Promise<string | null> {
		return this.get().getAttribute(name);
	}

	async inputValue(): Promise<string> {
		const el = this.get();
		if (
			el instanceof HTMLInputElement ||
			el instanceof HTMLTextAreaElement ||
			el instanceof HTMLSelectElement
		) {
			return el.value;
		}
		throw new TypeError(
			`inputValue requires an <input>, <textarea>, or <select> element, got <${el.tagName.toLowerCase()}>`,
		);
	}

	async isVisible(): Promise<boolean> {
		const el = this.get();
		const style = window.getComputedStyle(el);
		return (
			style.display !== "none" &&
			style.visibility !== "hidden" &&
			style.opacity !== "0"
		);
	}

	async isEnabled(): Promise<boolean> {
		return !isDisabled(this.get());
	}

	async isChecked(): Promise<boolean> {
		const el = this.get();
		if (el instanceof HTMLInputElement) {
			return el.checked;
		}
		return el.getAttribute("aria-checked") === "true";
	}

	// --- Internal ---------------------------------------------------------

	private lazy(query: Query): Locator<HTMLElement> {
		return asCallable(
			new RtlLocator(
				this.container,
				() => runQueryAll(this.strict(), query),
				this.user,
				describeQuery(query),
			),
		);
	}

	/** Exactly one match (getBy / findBy). */
	private strict(): HTMLElement {
		const results = this.atLeastOne();
		if (results.length > 1) this.throwMultiple(results.length);
		return results[0];
	}

	/** One or more matches (getAllBy / findAllBy). */
	private atLeastOne(): HTMLElement[] {
		const results = this.candidates();
		if (results.length === 0) {
			throw new QueryError(
				`Unable to find element with ${this.description}`,
				"not-found",
			);
		}
		return results;
	}

	/** Like candidates(), but a missing parent yields [] (queryBy semantics). */
	private candidatesOrEmpty(): HTMLElement[] {
		try {
			return this.candidates();
		} catch (error) {
			if (error instanceof QueryError && error.reason === "not-found") {
				return [];
			}
			throw error;
		}
	}

	private throwMultiple(count: number): never {
		throw new QueryError(
			`Found multiple elements (${count}) with ${this.description}. Use getAll()/findAll() to match more than one.`,
			"multiple",
		);
	}

	/** Run synchronously; decorate query errors like RTL (with a DOM snapshot). */
	private sync<R>(fn: () => R): R {
		try {
			return fn();
		} catch (error) {
			if (error instanceof QueryError) {
				throw getConfig().getElementError(error.message, this.container);
			}
			throw error;
		}
	}

	/** Retry until success; RTL's waitFor adds the DOM snapshot on timeout. */
	private wait<R>(fn: () => R, options?: FindOptions): Promise<R> {
		return waitFor(fn, {
			container: this.container,
			timeout: options?.timeout ?? 1000,
			interval: options?.interval ?? 50,
		});
	}
}

// ---------------------------------------------------------------------------
// Query execution — delegated to @testing-library/dom
// ---------------------------------------------------------------------------

function runQueryAll(root: HTMLElement, q: Query): HTMLElement[] {
	switch (q.kind) {
		case "role": {
			const { disabled, ...options } = q.options ?? {};
			const results = queryAllByRole(root, q.role, options as DomByRoleOptions);
			// @testing-library/dom has no `disabled` filter; apply it here.
			return disabled === undefined
				? results
				: results.filter((el) => isDisabled(el) === disabled);
		}
		case "label":
			return queryAllByLabelText(root, q.text);
		case "placeholder":
			return queryAllByPlaceholderText(root, q.text);
		case "text":
			return queryAllByText(root, q.text);
		case "testid":
			return queryAllByTestId(root, q.id);
	}
}

function describeQuery(q: Query): string {
	switch (q.kind) {
		case "role": {
			const { name, ...rest } = q.options ?? {};
			const extra = Object.entries(rest)
				.filter(([, v]) => v !== undefined)
				.map(([k, v]) => ` and ${k}=${v}`)
				.join("");
			return `role "${q.role}"${name !== undefined ? ` and name "${name}"` : ""}${extra}`;
		}
		case "label":
			return `label "${q.text}"`;
		case "text":
			return `text "${q.text}"`;
		case "placeholder":
			return `placeholder "${q.text}"`;
		case "testid":
			return `${getConfig().testIdAttribute} "${q.id}"`;
	}
}

function isDisabled(el: HTMLElement): boolean {
	return (
		el.matches(":disabled") || el.closest('[aria-disabled="true"]') !== null
	);
}

function setNativeValue(el: HTMLElement, value: string): void {
	const desc = Object.getOwnPropertyDescriptor(
		Object.getPrototypeOf(el),
		"value",
	);
	desc?.set?.call(el, value);
	el.dispatchEvent(new Event("input", { bubbles: true }));
	el.dispatchEvent(new Event("change", { bubbles: true }));
}
