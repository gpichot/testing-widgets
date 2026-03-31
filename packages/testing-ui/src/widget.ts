import type { LocatorWith } from "./enhanced.js";
import { enhance } from "./enhanced.js";
import type { Locator } from "./types.js";

/**
 * Recursively replaces `Locator<unknown>` / `LocatorWith<unknown>` with
 * their `<N>`-parameterised counterparts so the native element type flows
 * through widget definitions.
 */
type Retype<T, N> = T extends LocatorWith<unknown>
	? LocatorWith<N>
	: T extends Locator<unknown>
		? Locator<N>
		: T extends (...args: infer A) => infer R
			? (...args: A) => Retype<R, N>
			: T extends Promise<infer P>
				? Promise<Retype<P, N>>
				: T extends object
					? { [K in keyof T]: Retype<T[K], N> }
					: T;

/**
 * Defines a reusable, runner-agnostic widget.
 *
 * The factory receives a {@link LocatorWith} — an enhanced locator with
 * role shortcuts like `button()`, `textbox()`, `heading()` and short
 * aliases like `byRole()`, `byLabel()`, `byText()`.
 *
 * The native element type (`HTMLElement`, Playwright `Locator`, etc.) is
 * inferred at the `.from()` call site and propagated through all returned
 * locators, so no type assertions are needed in test code.
 *
 * @example
 * ```ts
 * const loginForm = widget((l) => ({
 *   elements: {
 *     email: () => l.byLabel("Email"),
 *     password: () => l.byLabel("Password"),
 *     submit: () => l.button({ name: "Sign in" }),
 *   },
 *   actions: {
 *     login: async (email: string, password: string) => {
 *       await l.byLabel("Email").fill(email);
 *       await l.byLabel("Password").fill(password);
 *       await l.button({ name: "Sign in" }).click();
 *     },
 *   },
 * }));
 *
 * // Connect to RTL
 * const { elements, actions } = loginForm.from(rtl(container, user));
 *
 * // Or Playwright
 * const { elements, actions } = loginForm.from(playwright(page));
 * ```
 */
export function widget<T>(factory: (locator: LocatorWith) => T) {
	return {
		from<N>(locator: Locator<N>): Retype<T, N> {
			return factory(enhance(locator)) as Retype<T, N>;
		},
	};
}

export type WidgetDef<T> = ReturnType<typeof widget<T>>;
