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

/** Minimal surface needed from a Playwright Page or FrameLocator. */
interface PwPage {
	getByRole(role: string, options?: { name?: string | RegExp }): PwLocatable;
	getByLabel(text: string | RegExp): PwLocatable;
	getByPlaceholder(text: string | RegExp): PwLocatable;
	getByText(text: string | RegExp): PwLocatable;
	getByTestId(testId: string): PwLocatable;
}

export function playwright(page: PwPage | PwLocatable): Locator {
	return asCallable(new PwAdapter(page));
}

class PwAdapter implements LocatorMethods {
	constructor(private pw: PwPage | PwLocatable) {}

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

	private get locatable(): PwLocatable {
		return this.pw as PwLocatable;
	}

	get(): PwPage | PwLocatable {
		return this.pw;
	}

	getAll(): (PwPage | PwLocatable)[] {
		throw new Error(
			"Playwright getAll() is async — use find() or await locator.get().all() instead",
		);
	}

	query(): PwPage | PwLocatable {
		// Playwright locators are always lazy — query() returns the locator itself
		return this.pw;
	}

	queryAll(): (PwPage | PwLocatable)[] {
		throw new Error(
			"Playwright queryAll() is async — use await locator.get().all() instead",
		);
	}

	async find(): Promise<PwPage | PwLocatable> {
		return this.pw;
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
