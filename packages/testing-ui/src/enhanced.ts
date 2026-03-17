import { asCallable } from "./callable.js";
import type { ByRoleOptions, Locator, LocatorMethods } from "./types.js";

/**
 * Extended locator with role shortcuts and concise aliases.
 * Adapters implement the base `Locator`; these shortcuts are added
 * automatically by `widget()`.
 */
export interface LocatorWith extends Locator {
	// --- Short aliases for getBy* -----------------------------------------
	byRole(role: string, options?: ByRoleOptions): LocatorWith;
	byLabel(text: string | RegExp): LocatorWith;
	byPlaceholder(text: string | RegExp): LocatorWith;
	byText(text: string | RegExp): LocatorWith;
	byTestId(testId: string): LocatorWith;

	// --- Role shortcuts ---------------------------------------------------
	button(options?: Pick<ByRoleOptions, "name">): LocatorWith;
	link(options?: Pick<ByRoleOptions, "name">): LocatorWith;
	textbox(options?: Pick<ByRoleOptions, "name">): LocatorWith;
	checkbox(options?: Pick<ByRoleOptions, "name" | "checked">): LocatorWith;
	radio(options?: Pick<ByRoleOptions, "name" | "checked">): LocatorWith;
	combobox(options?: Pick<ByRoleOptions, "name">): LocatorWith;
	heading(options?: Pick<ByRoleOptions, "name">): LocatorWith;
	dialog(options?: Pick<ByRoleOptions, "name">): LocatorWith;
	list(options?: Pick<ByRoleOptions, "name">): LocatorWith;
	listitem(options?: Pick<ByRoleOptions, "name">): LocatorWith;
	img(options?: Pick<ByRoleOptions, "name">): LocatorWith;
	tab(options?: Pick<ByRoleOptions, "name" | "selected">): LocatorWith;
	tabpanel(options?: Pick<ByRoleOptions, "name">): LocatorWith;
	navigation(options?: Pick<ByRoleOptions, "name">): LocatorWith;
	region(options?: Pick<ByRoleOptions, "name">): LocatorWith;
}

/**
 * Wrap a base Locator with shortcut methods.
 */
export function enhance(base: Locator): LocatorWith {
	return asCallable(new LocatorProxy(base)) as LocatorWith;
}

class LocatorProxy implements LocatorMethods {
	constructor(private base: Locator) {}

	// --- Base Locator (delegate & wrap) ------------------------------------

	private wrap(locator: Locator): LocatorWith {
		return asCallable(new LocatorProxy(locator)) as LocatorWith;
	}

	getByRole(role: string, options?: ByRoleOptions): LocatorWith {
		return this.wrap(this.base.getByRole(role, options));
	}
	getByLabel(text: string | RegExp): LocatorWith {
		return this.wrap(this.base.getByLabel(text));
	}
	getByPlaceholder(text: string | RegExp): LocatorWith {
		return this.wrap(this.base.getByPlaceholder(text));
	}
	getByText(text: string | RegExp): LocatorWith {
		return this.wrap(this.base.getByText(text));
	}
	getByTestId(testId: string): LocatorWith {
		return this.wrap(this.base.getByTestId(testId));
	}

	get() {
		return this.base.get();
	}
	getAll() {
		return this.base.getAll();
	}
	query() {
		return this.base.query();
	}
	queryAll() {
		return this.base.queryAll();
	}
	find() {
		return this.base.find();
	}

	click() {
		return this.base.click();
	}
	fill(value: string) {
		return this.base.fill(value);
	}
	check() {
		return this.base.check();
	}
	uncheck() {
		return this.base.uncheck();
	}
	selectOption(value: string | string[]) {
		return this.base.selectOption(value);
	}
	clear() {
		return this.base.clear();
	}
	textContent() {
		return this.base.textContent();
	}
	getAttribute(name: string) {
		return this.base.getAttribute(name);
	}
	inputValue() {
		return this.base.inputValue();
	}
	isVisible() {
		return this.base.isVisible();
	}
	isEnabled() {
		return this.base.isEnabled();
	}
	isChecked() {
		return this.base.isChecked();
	}

	// --- Short aliases ----------------------------------------------------

	byRole(role: string, options?: ByRoleOptions) {
		return this.getByRole(role, options);
	}
	byLabel(text: string | RegExp) {
		return this.getByLabel(text);
	}
	byPlaceholder(text: string | RegExp) {
		return this.getByPlaceholder(text);
	}
	byText(text: string | RegExp) {
		return this.getByText(text);
	}
	byTestId(testId: string) {
		return this.getByTestId(testId);
	}

	// --- Role shortcuts ---------------------------------------------------

	button(options?: Pick<ByRoleOptions, "name">) {
		return this.getByRole("button", options);
	}
	link(options?: Pick<ByRoleOptions, "name">) {
		return this.getByRole("link", options);
	}
	textbox(options?: Pick<ByRoleOptions, "name">) {
		return this.getByRole("textbox", options);
	}
	checkbox(options?: Pick<ByRoleOptions, "name" | "checked">) {
		return this.getByRole("checkbox", options);
	}
	radio(options?: Pick<ByRoleOptions, "name" | "checked">) {
		return this.getByRole("radio", options);
	}
	combobox(options?: Pick<ByRoleOptions, "name">) {
		return this.getByRole("combobox", options);
	}
	heading(options?: Pick<ByRoleOptions, "name">) {
		return this.getByRole("heading", options);
	}
	dialog(options?: Pick<ByRoleOptions, "name">) {
		return this.getByRole("dialog", options);
	}
	list(options?: Pick<ByRoleOptions, "name">) {
		return this.getByRole("list", options);
	}
	listitem(options?: Pick<ByRoleOptions, "name">) {
		return this.getByRole("listitem", options);
	}
	img(options?: Pick<ByRoleOptions, "name">) {
		return this.getByRole("img", options);
	}
	tab(options?: Pick<ByRoleOptions, "name" | "selected">) {
		return this.getByRole("tab", options);
	}
	tabpanel(options?: Pick<ByRoleOptions, "name">) {
		return this.getByRole("tabpanel", options);
	}
	navigation(options?: Pick<ByRoleOptions, "name">) {
		return this.getByRole("navigation", options);
	}
	region(options?: Pick<ByRoleOptions, "name">) {
		return this.getByRole("region", options);
	}
}
