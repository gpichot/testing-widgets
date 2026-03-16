/**
 * Core abstraction layer for the Widget Object Model.
 *
 * A Locator represents a way to find and interact with UI elements,
 * independent of the underlying test runner (RTL, Playwright, etc.)
 * or UI framework (React, Vue, etc.).
 */

/**
 * Represents a handle to a UI element that can be queried and interacted with.
 * This is the fundamental building block — adapters implement this interface
 * to bridge to their specific runner.
 */
export interface Locator {
	/** Find a descendant element by role */
	getByRole(role: string, options?: GetByRoleOptions): Locator;
	/** Find a descendant element by label text */
	getByLabel(text: string | RegExp): Locator;
	/** Find a descendant element by placeholder text */
	getByPlaceholder(text: string | RegExp): Locator;
	/** Find a descendant element by text content */
	getByText(text: string | RegExp): Locator;
	/** Find a descendant element by test id */
	getByTestId(testId: string): Locator;

	/** Click the element */
	click(): Promise<void>;
	/** Fill a text input */
	fill(value: string): Promise<void>;
	/** Check a checkbox or radio */
	check(): Promise<void>;
	/** Uncheck a checkbox */
	uncheck(): Promise<void>;
	/** Select an option in a select element */
	selectOption(value: string | string[]): Promise<void>;

	/** Get the text content */
	textContent(): Promise<string | null>;
	/** Get an attribute value */
	getAttribute(name: string): Promise<string | null>;
	/** Get the input value */
	inputValue(): Promise<string>;
	/** Check if the element is visible */
	isVisible(): Promise<boolean>;
	/** Check if the element is enabled */
	isEnabled(): Promise<boolean>;
	/** Check if the element is checked */
	isChecked(): Promise<boolean>;
}

export interface GetByRoleOptions {
	name?: string | RegExp;
	checked?: boolean;
	disabled?: boolean;
	expanded?: boolean;
	selected?: boolean;
	pressed?: boolean;
}

/**
 * A Screen represents the root container for locating elements.
 * In RTL this maps to the `screen` object, in Playwright to `page`.
 */
export interface Screen extends Locator {}

/**
 * Factory function type that adapters must implement to create a Screen
 * from their runner-specific context.
 */
export type CreateScreen<TContext = unknown> = (context: TContext) => Screen;
