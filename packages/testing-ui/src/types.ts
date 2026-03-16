/**
 * Core abstraction for querying and interacting with UI elements,
 * independent of the test runner (RTL, Playwright) or UI framework (React, Vue).
 */
export interface Locator {
	// --- Queries ---
	getByRole(role: string, options?: ByRoleOptions): Locator;
	getByLabel(text: string | RegExp): Locator;
	getByPlaceholder(text: string | RegExp): Locator;
	getByText(text: string | RegExp): Locator;
	getByTestId(testId: string): Locator;

	// --- Actions ---
	click(): Promise<void>;
	fill(value: string): Promise<void>;
	check(): Promise<void>;
	uncheck(): Promise<void>;
	selectOption(value: string | string[]): Promise<void>;
	clear(): Promise<void>;

	// --- State ---
	textContent(): Promise<string | null>;
	getAttribute(name: string): Promise<string | null>;
	inputValue(): Promise<string>;
	isVisible(): Promise<boolean>;
	isEnabled(): Promise<boolean>;
	isChecked(): Promise<boolean>;
}

export interface ByRoleOptions {
	name?: string | RegExp;
	checked?: boolean;
	disabled?: boolean;
	expanded?: boolean;
	selected?: boolean;
	pressed?: boolean;
}
