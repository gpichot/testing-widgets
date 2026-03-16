/**
 * Playwright adapter for the Widget Object Model.
 *
 * This adapter bridges the Locator/Screen interfaces to Playwright's Page/Locator.
 * Usage:
 *
 * ```ts
 * import { createScreen } from "testing-ui/adapters/playwright";
 * import { test } from "@playwright/test";
 *
 * test("example", async ({ page }) => {
 *   const screen = createScreen(page);
 *   // use widgets with screen...
 * });
 * ```
 */

import type {
	CreateScreen,
	GetByRoleOptions,
	Locator,
	Screen,
} from "../types.js";

/**
 * Minimal subset of Playwright's Page that we depend on.
 * This avoids requiring @playwright/test as a compile-time dependency.
 */
interface PlaywrightPage {
	getByRole(
		role: string,
		options?: { name?: string | RegExp },
	): PlaywrightLocator;
	getByLabel(text: string | RegExp): PlaywrightLocator;
	getByPlaceholder(text: string | RegExp): PlaywrightLocator;
	getByText(text: string | RegExp): PlaywrightLocator;
	getByTestId(testId: string): PlaywrightLocator;
}

interface PlaywrightLocator {
	getByRole(
		role: string,
		options?: { name?: string | RegExp },
	): PlaywrightLocator;
	getByLabel(text: string | RegExp): PlaywrightLocator;
	getByPlaceholder(text: string | RegExp): PlaywrightLocator;
	getByText(text: string | RegExp): PlaywrightLocator;
	getByTestId(testId: string): PlaywrightLocator;
	click(): Promise<void>;
	fill(value: string): Promise<void>;
	check(): Promise<void>;
	uncheck(): Promise<void>;
	selectOption(value: string | string[]): Promise<void>;
	textContent(): Promise<string | null>;
	getAttribute(name: string): Promise<string | null>;
	inputValue(): Promise<string>;
	isVisible(): Promise<boolean>;
	isEnabled(): Promise<boolean>;
	isChecked(): Promise<boolean>;
}

export const createScreen: CreateScreen<PlaywrightPage> = (
	page: PlaywrightPage,
): Screen => {
	return new PlaywrightLocatorAdapter(page);
};

class PlaywrightLocatorAdapter implements Locator {
	constructor(private pw: PlaywrightPage | PlaywrightLocator) {}

	getByRole(role: string, options?: GetByRoleOptions): Locator {
		return new PlaywrightLocatorAdapter(
			this.pw.getByRole(role, options ? { name: options.name } : undefined),
		);
	}

	getByLabel(text: string | RegExp): Locator {
		return new PlaywrightLocatorAdapter(this.pw.getByLabel(text));
	}

	getByPlaceholder(text: string | RegExp): Locator {
		return new PlaywrightLocatorAdapter(this.pw.getByPlaceholder(text));
	}

	getByText(text: string | RegExp): Locator {
		return new PlaywrightLocatorAdapter(this.pw.getByText(text));
	}

	getByTestId(testId: string): Locator {
		return new PlaywrightLocatorAdapter(this.pw.getByTestId(testId));
	}

	async click(): Promise<void> {
		await (this.pw as PlaywrightLocator).click();
	}

	async fill(value: string): Promise<void> {
		await (this.pw as PlaywrightLocator).fill(value);
	}

	async check(): Promise<void> {
		await (this.pw as PlaywrightLocator).check();
	}

	async uncheck(): Promise<void> {
		await (this.pw as PlaywrightLocator).uncheck();
	}

	async selectOption(value: string | string[]): Promise<void> {
		await (this.pw as PlaywrightLocator).selectOption(value);
	}

	async textContent(): Promise<string | null> {
		return (this.pw as PlaywrightLocator).textContent();
	}

	async getAttribute(name: string): Promise<string | null> {
		return (this.pw as PlaywrightLocator).getAttribute(name);
	}

	async inputValue(): Promise<string> {
		return (this.pw as PlaywrightLocator).inputValue();
	}

	async isVisible(): Promise<boolean> {
		return (this.pw as PlaywrightLocator).isVisible();
	}

	async isEnabled(): Promise<boolean> {
		return (this.pw as PlaywrightLocator).isEnabled();
	}

	async isChecked(): Promise<boolean> {
		return (this.pw as PlaywrightLocator).isChecked();
	}
}
