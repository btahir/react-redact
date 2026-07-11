import { afterEach, describe, expect, it, vi } from "vitest";
import { watchScreenShare } from "../../src/utils/screen-share.js";

/** Minimal fake MediaStreamTrack: a real EventTarget plus an `end()` helper to fire "ended". */
function createFakeTrack() {
	const target = new EventTarget();
	return {
		addEventListener: target.addEventListener.bind(target),
		removeEventListener: target.removeEventListener.bind(target),
		end() {
			target.dispatchEvent(new Event("ended"));
		},
	};
}

function createFakeStream(tracks: ReturnType<typeof createFakeTrack>[]) {
	return {
		getVideoTracks: () => tracks,
	};
}

function installMediaDevices(getDisplayMedia: (...args: unknown[]) => Promise<unknown>) {
	Object.defineProperty(navigator, "mediaDevices", {
		value: { getDisplayMedia },
		configurable: true,
		writable: true,
	});
}

afterEach(() => {
	// Remove whatever the test installed so state doesn't leak between tests.
	Object.defineProperty(navigator, "mediaDevices", {
		value: undefined,
		configurable: true,
		writable: true,
	});
	vi.restoreAllMocks();
});

describe("watchScreenShare", () => {
	it("calls onStart when a capture resolves and onEnd when its track ends", async () => {
		const track = createFakeTrack();
		const stream = createFakeStream([track]);
		installMediaDevices(async () => stream);

		const onStart = vi.fn();
		const onEnd = vi.fn();
		const watcher = watchScreenShare({ onStart, onEnd });

		await navigator.mediaDevices.getDisplayMedia();
		expect(onStart).toHaveBeenCalledTimes(1);
		expect(onEnd).not.toHaveBeenCalled();

		track.end();
		expect(onEnd).toHaveBeenCalledTimes(1);

		watcher.stop();
	});

	it("does not call onStart or onEnd when the picker promise rejects (user cancels)", async () => {
		installMediaDevices(async () => {
			throw new DOMException("Permission denied", "NotAllowedError");
		});

		const onStart = vi.fn();
		const onEnd = vi.fn();
		const watcher = watchScreenShare({ onStart, onEnd });

		await expect(navigator.mediaDevices.getDisplayMedia()).rejects.toThrow();
		expect(onStart).not.toHaveBeenCalled();
		expect(onEnd).not.toHaveBeenCalled();

		watcher.stop();
	});

	it("only calls onEnd once the last of multiple concurrent streams ends", async () => {
		const trackA = createFakeTrack();
		const trackB = createFakeTrack();
		let call = 0;
		const streams = [createFakeStream([trackA]), createFakeStream([trackB])];
		installMediaDevices(async () => streams[call++]);

		const onStart = vi.fn();
		const onEnd = vi.fn();
		const watcher = watchScreenShare({ onStart, onEnd });

		await navigator.mediaDevices.getDisplayMedia();
		await navigator.mediaDevices.getDisplayMedia();
		// Second concurrent stream starting shouldn't re-fire onStart.
		expect(onStart).toHaveBeenCalledTimes(1);

		trackA.end();
		expect(onEnd).not.toHaveBeenCalled(); // trackB's stream is still active

		trackB.end();
		expect(onEnd).toHaveBeenCalledTimes(1);

		watcher.stop();
	});

	it("stop() restores the original getDisplayMedia function", async () => {
		const original = async () => createFakeStream([createFakeTrack()]);
		installMediaDevices(original);

		const patchedRef = navigator.mediaDevices.getDisplayMedia;
		const watcher = watchScreenShare({ onStart: vi.fn(), onEnd: vi.fn() });
		expect(navigator.mediaDevices.getDisplayMedia).not.toBe(patchedRef);

		watcher.stop();
		expect(navigator.mediaDevices.getDisplayMedia).toBe(original);
	});

	it("is a no-op when navigator.mediaDevices is unavailable", () => {
		Object.defineProperty(navigator, "mediaDevices", {
			value: undefined,
			configurable: true,
			writable: true,
		});
		const onStart = vi.fn();
		const onEnd = vi.fn();
		expect(() => watchScreenShare({ onStart, onEnd }).stop()).not.toThrow();
		expect(onStart).not.toHaveBeenCalled();
		expect(onEnd).not.toHaveBeenCalled();
	});

	it("is a no-op when getDisplayMedia is not a function", () => {
		Object.defineProperty(navigator, "mediaDevices", {
			value: {},
			configurable: true,
			writable: true,
		});
		const watcher = watchScreenShare({ onStart: vi.fn(), onEnd: vi.fn() });
		expect(() => watcher.stop()).not.toThrow();
	});

	it("is a no-op during SSR (no navigator)", () => {
		vi.stubGlobal("navigator", undefined);
		const onStart = vi.fn();
		const onEnd = vi.fn();
		expect(() => watchScreenShare({ onStart, onEnd }).stop()).not.toThrow();
		expect(onStart).not.toHaveBeenCalled();
		expect(onEnd).not.toHaveBeenCalled();
		vi.unstubAllGlobals();
	});
});
