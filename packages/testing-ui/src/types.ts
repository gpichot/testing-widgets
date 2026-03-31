/**
 * Methods available on a locator — implemented by adapter classes.
 * Use {@link Locator} for the public-facing callable type.
 *
 * @typeParam T - The native element/locator type resolved by the adapter
 *               (e.g. `HTMLElement` for RTL, Playwright `Locator` for Playwright).
 */
export interface LocatorMethods<T = unknown> {
	// --- Queries ---
	getByRole(role: string, options?: ByRoleOptions): Locator<T>;
	getByLabel(text: string | RegExp): Locator<T>;
	getByPlaceholder(text: string | RegExp): Locator<T>;
	getByText(text: string | RegExp): Locator<T>;
	getByTestId(testId: string): Locator<T>;

	// --- Resolution ---
	/** Resolve to the native element/locator. Throws if not found. */
	get(): T;
	/** Resolve all matching native elements/locators. Throws if none found. */
	getAll(): T[];
	/** Resolve to the native element/locator, or null if not found. */
	query(): T | null;
	/** Resolve all matching native elements/locators (empty array if none). */
	queryAll(): T[];
	/** Async resolution — waits for the element to appear. */
	find(): Promise<T>;

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

/**
 * A callable locator. Calling it directly is shorthand for `.get()`.
 *
 * @typeParam T - The native element/locator type resolved by the adapter.
 *
 * @example
 * ```ts
 * const heading = locator.getByRole("heading");
 * heading()       // → get() — returns the native element
 * heading.get()   // same as above
 * heading.query() // returns null instead of throwing
 * ```
 */
export interface Locator<T = unknown> extends LocatorMethods<T> {
	/** Shorthand for get(). */
	(): T;
}

export interface ByRoleOptions {
	name?: string | RegExp;
	checked?: boolean;
	disabled?: boolean;
	expanded?: boolean;
	selected?: boolean;
	pressed?: boolean;
}
