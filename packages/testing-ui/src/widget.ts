import type { Locator, Screen } from "./types.js";

/**
 * Base class for Widget Object Models.
 *
 * A Widget represents a reusable UI component abstraction.
 * It encapsulates how to locate elements and interact with them,
 * without coupling to a specific test runner or UI framework.
 *
 * @example
 * ```ts
 * class LoginForm extends Widget {
 *   get email() {
 *     return this.locator.getByLabel("Email");
 *   }
 *   get password() {
 *     return this.locator.getByLabel("Password");
 *   }
 *   get submitButton() {
 *     return this.locator.getByRole("button", { name: "Sign in" });
 *   }
 *
 *   async login(email: string, password: string) {
 *     await this.email.fill(email);
 *     await this.password.fill(password);
 *     await this.submitButton.click();
 *   }
 * }
 *
 * // Usage with any adapter:
 * const screen = createScreen(context);
 * const loginForm = new LoginForm(screen);
 * await loginForm.login("user@example.com", "password");
 * ```
 */
export class Widget {
	constructor(protected readonly locator: Locator) {}

	/**
	 * Create a widget scoped to a specific locator within a screen.
	 */
	static from<T extends Widget>(
		ctor: new (locator: Locator) => T,
		screenOrLocator: Screen | Locator,
	): T {
		return new ctor(screenOrLocator);
	}
}
