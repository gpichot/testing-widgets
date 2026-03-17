/**
 * Playwright adapter.
 *
 * @example
 * ```ts
 * import { playwright } from "testing-ui/adapters/playwright";
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

/** Minimal Playwright locator/page surface we depend on (no compile-time dep). */
interface PwLocatable {
	getByRole(role: string, options?: { name?: string | RegExp }): PwLocatable;
	getByLabel(text: string | RegExp): PwLocatable;
	getByPlaceholder(text: string | RegExp): PwLocatable;
	getByText(text: string | RegExp): PwLocatable;
	getByTestId(testId: string): PwLocatable;
	click(): Promise<void>;
	fill(value: string): Promise<void>;
	check(): Promise<void>;
	uncheck(): Promise<void>;
	selectOption(value: string | string[]): Promise<void>;
	clear(): Promise<void>;
	textContent(): Promise<string | null>;
	getAttribute(name: string): Promise<string | null>;
	inputValue(): Promise<string>;
	isVisible(): Promise<boolean>;
	isEnabled(): Promise<boolean>;
	isChecked(): Promise<boolean>;
	all(): Promise<PwLocatable[]>;
}

export function playwright(page: PwLocatable): Locator {
	return asCallable(new PwAdapter(page));
}

class PwAdapter implements LocatorMethods {
	constructor(private pw: PwLocatable) {}

	getByRole(role: string, options?: ByRoleOptions): Locator {
		return asCallable(
			new PwAdapter(
				this.pw.getByRole(role, options ? { name: options.name } : undefined),
			),
		);
	}

	getByLabel(text: string | RegExp): Locator {
		return asCallable(new PwAdapter(this.pw.getByLabel(text)));
	}

	getByPlaceholder(text: string | RegExp): Locator {
		return asCallable(new PwAdapter(this.pw.getByPlaceholder(text)));
	}

	getByText(text: string | RegExp): Locator {
		return asCallable(new PwAdapter(this.pw.getByText(text)));
	}

	getByTestId(testId: string): Locator {
		return asCallable(new PwAdapter(this.pw.getByTestId(testId)));
	}

	get(): PwLocatable {
		return this.pw;
	}

	getAll(): PwLocatable[] {
		throw new Error(
			"Playwright getAll() is async — use find() or await locator.get().all() instead",
		);
	}

	query(): PwLocatable {
		// Playwright locators are always lazy — query() returns the locator itself
		return this.pw;
	}

	queryAll(): PwLocatable[] {
		throw new Error(
			"Playwright queryAll() is async — use await locator.get().all() instead",
		);
	}

	async find(): Promise<PwLocatable> {
		return this.pw;
	}

	click() {
		return this.pw.click();
	}
	fill(value: string) {
		return this.pw.fill(value);
	}
	check() {
		return this.pw.check();
	}
	uncheck() {
		return this.pw.uncheck();
	}
	selectOption(value: string | string[]) {
		return this.pw.selectOption(value);
	}
	clear() {
		return this.pw.clear();
	}

	textContent() {
		return this.pw.textContent();
	}
	getAttribute(name: string) {
		return this.pw.getAttribute(name);
	}
	inputValue() {
		return this.pw.inputValue();
	}
	isVisible() {
		return this.pw.isVisible();
	}
	isEnabled() {
		return this.pw.isEnabled();
	}
	isChecked() {
		return this.pw.isChecked();
	}
}
