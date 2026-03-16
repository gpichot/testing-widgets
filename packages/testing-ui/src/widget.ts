import type { LocatorWith } from "./enhanced.js";
import { enhance } from "./enhanced.js";
import type { Locator } from "./types.js";

/**
 * Defines a reusable, runner-agnostic widget.
 *
 * The factory receives a {@link LocatorWith} — an enhanced locator with
 * role shortcuts like `button()`, `textbox()`, `heading()` and short
 * aliases like `byRole()`, `byLabel()`, `byText()`.
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
		from(locator: Locator): T {
			return factory(enhance(locator));
		},
	};
}

export type WidgetDef<T> = ReturnType<typeof widget<T>>;
