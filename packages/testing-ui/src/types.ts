/**
 * Methods available on a locator — implemented by adapter classes.
 * Use {@link Locator} for the public-facing callable type.
 */
export interface LocatorMethods {
	// --- Queries ---
	getByRole(role: string, options?: ByRoleOptions): Locator;
	getByLabel(text: string | RegExp): Locator;
	getByPlaceholder(text: string | RegExp): Locator;
	getByText(text: string | RegExp): Locator;
	getByTestId(testId: string): Locator;

	// --- Resolution ---
	/** Resolve to the native element/locator. Throws if not found. */
	get(): unknown;
	/** Resolve all matching native elements/locators. Throws if none found. */
	getAll(): unknown[];
	/** Resolve to the native element/locator, or null if not found. */
	query(): unknown | null;
	/** Resolve all matching native elements/locators (empty array if none). */
	queryAll(): unknown[];
	/** Async resolution — waits for the element to appear. */
	find(): Promise<unknown>;

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
 * @example
 * ```ts
 * const heading = locator.getByRole("heading");
 * heading()       // → get() — returns the native element
 * heading.get()   // same as above
 * heading.query() // returns null instead of throwing
 * ```
 */
export interface Locator extends LocatorMethods {
	/** Shorthand for get(). */
	(): unknown;
}

export interface ByRoleOptions {
	name?: string | RegExp;
	checked?: boolean;
	disabled?: boolean;
	expanded?: boolean;
	selected?: boolean;
	pressed?: boolean;
}
