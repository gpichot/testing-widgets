/**
 * Retry-until-success helper backing `find()` / `findAll()` in the RTL adapter.
 *
 * Uses `waitFor` from `@testing-library/dom` when it is installed (it always is
 * alongside `@testing-library/react` >= 16). That gives act()-wrapped polling
 * (React's asyncWrapper), MutationObserver wake-ups and fake-timer support.
 * Falls back to a built-in MutationObserver + interval loop otherwise.
 */

export interface FindOptions {
	/** Max time to wait in ms. Defaults to 1000 (same as RTL `findBy*`). */
	timeout?: number;
	/** Polling interval in ms. Defaults to 50 (same as RTL `waitFor`). */
	interval?: number;
}

type WaitFor = <T>(callback: () => T, options?: FindOptions) => Promise<T>;

let waitForPromise: Promise<WaitFor> | undefined;

function loadWaitFor(): Promise<WaitFor> {
	waitForPromise ??= import("@testing-library/dom")
		.then((m) => m.waitFor as WaitFor)
		.catch(() => pollWaitFor);
	return waitForPromise;
}

export async function waitUntil<T>(
	callback: () => T,
	options?: FindOptions,
): Promise<T> {
	const waitFor = await loadWaitFor();
	return waitFor(callback, {
		timeout: options?.timeout ?? 1000,
		interval: options?.interval ?? 50,
	});
}

/** Dependency-free fallback. Exported for tests. */
export function pollWaitFor<T>(
	callback: () => T,
	{ timeout = 1000, interval = 50 }: FindOptions = {},
): Promise<T> {
	return new Promise<T>((resolve, reject) => {
		let lastError: unknown;
		let done = false;

		const finish = (fn: () => void) => {
			if (done) return;
			done = true;
			clearTimeout(timeoutId);
			clearInterval(intervalId);
			observer?.disconnect();
			fn();
		};

		const check = () => {
			try {
				const result = callback();
				finish(() => resolve(result));
			} catch (error) {
				lastError = error;
			}
		};

		const timeoutId = setTimeout(
			() =>
				finish(() =>
					reject(lastError ?? new Error(`Timed out after ${timeout}ms`)),
				),
			timeout,
		);
		const intervalId = setInterval(check, interval);
		const observer =
			typeof MutationObserver !== "undefined" && typeof document !== "undefined"
				? new MutationObserver(check)
				: undefined;
		observer?.observe(document, {
			subtree: true,
			childList: true,
			attributes: true,
			characterData: true,
		});

		check();
	});
}
