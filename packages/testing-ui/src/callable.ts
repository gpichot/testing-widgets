import type { Locator, LocatorMethods } from "./types.js";

/**
 * Wrap a LocatorMethods implementation so it is callable.
 * Calling the returned object directly is shorthand for `.get()`.
 *
 * Implementation note: the Proxy-based approach inherently requires
 * internal type casts because TypeScript cannot statically verify that
 * a Proxy adds interface members at runtime.
 */
export function asCallable<T>(impl: LocatorMethods<T>): Locator<T> {
	const fn = Object.setPrototypeOf(
		() => impl.get(),
		Object.getPrototypeOf(impl),
	) as Locator<T>;
	return new Proxy(fn, {
		get(_target, prop, receiver) {
			if (prop in impl) {
				const value =
					impl[prop as keyof LocatorMethods<T>] ??
					Reflect.get(impl, prop, impl);
				return value;
			}
			return Reflect.get(fn, prop, receiver);
		},
	});
}
