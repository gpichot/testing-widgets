import type { Locator, LocatorMethods } from "./types.js";

/**
 * Wrap a LocatorMethods implementation so it is callable.
 * Calling the returned object directly is shorthand for `.get()`.
 */
export function asCallable(impl: LocatorMethods): Locator {
	const fn = (() => impl.get()) as unknown as Locator;
	return new Proxy(fn, {
		get(_target, prop, receiver) {
			if (prop in impl) {
				return (impl as unknown as Record<string | symbol, unknown>)[prop];
			}
			return Reflect.get(fn, prop, receiver);
		},
	});
}
