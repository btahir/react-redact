export interface ScreenShareCallbacks {
	/** Called once, when the first concurrent same-tab screen-share capture starts. */
	onStart: () => void;
	/** Called once, when the last concurrent same-tab screen-share capture ends. */
	onEnd: () => void;
}

export interface ScreenShareWatcher {
	/** Restore the original `getDisplayMedia` and stop watching. Safe to call more than once. */
	stop: () => void;
}

type GetDisplayMedia = MediaDevices["getDisplayMedia"];

// Minimal shape we rely on from the resolved MediaStream — avoids requiring lib.dom's full
// MediaStream/MediaStreamTrack types (and lets tests supply lightweight fakes).
interface TrackLike {
	addEventListener: (type: "ended", listener: () => void) => void;
	removeEventListener?: (type: "ended", listener: () => void) => void;
}
interface StreamLike {
	getVideoTracks?: () => TrackLike[];
	addEventListener?: (type: "inactive", listener: () => void) => void;
	removeEventListener?: (type: "inactive", listener: () => void) => void;
}

/**
 * Wraps `navigator.mediaDevices.getDisplayMedia` to detect same-tab screen-share captures
 * started via the Screen Capture API, and calls `onStart`/`onEnd` around them.
 *
 * Only ever reacts to captures this page itself initiates (e.g. an in-app demo recorder or an
 * embedded recording SDK that calls `getDisplayMedia`) — it has no visibility into OS-level or
 * other-application screen shares, such as picking this tab/window from Zoom, Meet, or the
 * system screen-share picker outside a `getDisplayMedia` call.
 *
 * No-ops (returns a `stop()` that does nothing) when:
 * - called during SSR (no `navigator`)
 * - `navigator.mediaDevices.getDisplayMedia` doesn't exist (unsupported browser)
 *
 * Handles multiple concurrent streams (only the transition into/out of "any stream active"
 * fires `onStart`/`onEnd`) and picker cancellation (a rejected promise never fires either
 * callback — the wrapped function simply rejects, same as the original).
 */
export function watchScreenShare({ onStart, onEnd }: ScreenShareCallbacks): ScreenShareWatcher {
	if (typeof navigator === "undefined") return { stop: () => {} };

	const mediaDevices = navigator.mediaDevices as
		| (MediaDevices & { getDisplayMedia?: GetDisplayMedia })
		| undefined;
	if (!mediaDevices || typeof mediaDevices.getDisplayMedia !== "function") {
		return { stop: () => {} };
	}

	// Keep the exact original reference for restoration (so `stop()` puts back precisely what was
	// there before), and a bound copy for internal invocation (so `this` is correct regardless of
	// how `patched` ends up being called).
	const rawOriginal = mediaDevices.getDisplayMedia;
	const original = rawOriginal.bind(mediaDevices);
	let activeStreams = 0;

	function handleStreamEnd() {
		activeStreams = Math.max(0, activeStreams - 1);
		if (activeStreams === 0) onEnd();
	}

	const patched: GetDisplayMedia = async (...args) => {
		// Let a rejection (e.g. the user cancels the share picker) propagate untouched — we only
		// react once a stream actually resolves, so cancellation never toggles anything.
		const stream = (await original(...args)) as unknown as StreamLike;

		const wasIdle = activeStreams === 0;
		activeStreams += 1;
		if (wasIdle) onStart();

		let settled = false;
		const onTrackEnded = () => {
			if (settled) return;
			settled = true;
			handleStreamEnd();
		};

		const videoTracks = typeof stream.getVideoTracks === "function" ? stream.getVideoTracks() : [];
		for (const track of videoTracks) {
			track.addEventListener("ended", onTrackEnded);
		}
		// Fallback for streams that only expose an "inactive" event on the MediaStream itself.
		stream.addEventListener?.("inactive", onTrackEnded);

		return stream as unknown as MediaStream;
	};

	mediaDevices.getDisplayMedia = patched;

	return {
		stop: () => {
			if (mediaDevices.getDisplayMedia === patched) {
				mediaDevices.getDisplayMedia = rawOriginal;
			}
		},
	};
}
