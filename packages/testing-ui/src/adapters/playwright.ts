/**
 * Playwright adapter.
 *
 * @example
 * ```ts
 * import { playwright } from "testing-widgets/adapters/playwright";
 * import { test } from "@playwright/test";
 *
 * test("example", async ({ page }) => {
 *   const locator = playwright(page);
 *   const { elements, actions } = myWidget.from(locator);
 * });
 * ```
 */

import { asCallable } from "../callable.js";
import type { ByRoleOptions, Locator, LocatorMethods } from "../types.js";

/** Minimal Playwright locator surface we depend on (no compile-time dep). */
export interface PwLocatable {
	getByRole(role: string, options?: { name?: string | RegExp }): PwLocatable;
	getByLabel(text: string | RegExp): PwLocatable;
	getByPlaceholder(text: string | RegExp): PwLocatable;
	getByText(text: string | RegExp): PwLocatable;
	getByTestId(testId: string): PwLocatable;
	click(): Promise<void>;
	fill(value: string): Promise<void>;
	check(): Promise<void>;
	uncheck(): Promise<void>;
	selectOption(value: string | string[]): Promise<string[]>;
	clear(): Promise<void>;
	textContent(): Promise<string | null>;
	getAttribute(name: string): Promise<string | null>;
	inputValue(): Promise<string>;
	isVisible(): Promise<boolean>;
	isEnabled(): Promise<boolean>;
	isChecked(): Promise<boolean>;
	all(): Promise<PwLocatable[]>;
}

/**
 * Minimal surface needed from a Playwright Page or FrameLocator.
 * Generic over `L` so that callers who import the real Playwright types
 * preserve the concrete `Locator` type through the adapter.
 */
export interface PwPageLike<L extends PwLocatable = PwLocatable> {
	getByRole(role: string, options?: { name?: string | RegExp }): L;
	getByLabel(text: string | RegExp): L;
	getByPlaceholder(text: string | RegExp): L;
	getByText(text: string | RegExp): L;
	getByTestId(testId: string): L;
}

/**
 * Create a Locator backed by a Playwright Page or Locator.
 *
 * The generic parameter `L` is inferred from the page/locator you pass in,
 * so `.get()` returns the real Playwright `Locator` type — no assertions needed.
 */
export function playwright<L extends PwLocatable>(
	page: PwPageLike<L> | L,
): Locator<L> {
	return asCallable(new PwAdapter<L>(page));
}

class PwAdapter<L extends PwLocatable> implements LocatorMethods<L> {
	constructor(private pw: PwPageLike<L> | L) {}

	getByRole(role: string, options?: ByRoleOptions): Locator<L> {
		return asCallable(
			new PwAdapter<L>(
				this.pw.getByRole(
					role,
					options ? { name: options.name } : undefined,
				) as L,
			),
		);
	}

	getByLabel(text: string | RegExp): Locator<L> {
		return asCallable(new PwAdapter<L>(this.pw.getByLabel(text) as L));
	}

	getByPlaceholder(text: string | RegExp): Locator<L> {
		return asCallable(new PwAdapter<L>(this.pw.getByPlaceholder(text) as L));
	}

	getByText(text: string | RegExp): Locator<L> {
		return asCallable(new PwAdapter<L>(this.pw.getByText(text) as L));
	}

	getByTestId(testId: string): Locator<L> {
		return asCallable(new PwAdapter<L>(this.pw.getByTestId(testId) as L));
	}

	private get locatable(): L {
		return this.pw as L;
	}

	get(): L {
		return this.pw as L;
	}

	getAll(): L[] {
		throw new Error(
			"Playwright getAll() is async — use find() or await locator.get().all() instead",
		);
	}

	query(): L {
		// Playwright locators are always lazy — query() returns the locator itself
		return this.pw as L;
	}

	queryAll(): L[] {
		throw new Error(
			"Playwright queryAll() is async — use await locator.get().all() instead",
		);
	}

	async find(): Promise<L> {
		return this.pw as L;
	}

	click() {
		return this.locatable.click();
	}
	fill(value: string) {
		return this.locatable.fill(value);
	}
	check() {
		return this.locatable.check();
	}
	uncheck() {
		return this.locatable.uncheck();
	}
	async selectOption(value: string | string[]) {
		await this.locatable.selectOption(value);
	}
	clear() {
		return this.locatable.clear();
	}

	textContent() {
		return this.locatable.textContent();
	}
	getAttribute(name: string) {
		return this.locatable.getAttribute(name);
	}
	inputValue() {
		return this.locatable.inputValue();
	}
	isVisible() {
		return this.locatable.isVisible();
	}
	isEnabled() {
		return this.locatable.isEnabled();
	}
	isChecked() {
		return this.locatable.isChecked();
	}
}
