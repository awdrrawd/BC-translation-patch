/** Time-sliced, deduplicated queue; timed-out idle callbacks must still make progress. */
export function createIdleBatchProcessor(processOne, env = globalThis) {
    const queue = new Set();
    let scheduled = false, disposed = false, handle, kind;
    function pump(deadline) {
        if (disposed) return;
        try {
            let count = 0;
            while (queue.size && count < 24 &&
                (!deadline || deadline.didTimeout || deadline.timeRemaining() > 1)) {
                const item = queue.values().next().value;
                queue.delete(item);
                try { processOne(item); } catch (error) { console.debug("[BCTP] DOM translation failed", error); }
                count++;
            }
        } finally {
            scheduled = false;
            if (queue.size) schedule();
        }
    }
    function schedule() {
        if (scheduled || disposed) return;
        scheduled = true;
        if (typeof env.requestIdleCallback === "function") {
            kind = "idle";
            handle = env.requestIdleCallback(pump, { timeout: 200 });
        } else {
            kind = "frame";
            handle = env.requestAnimationFrame(() => {
                if (disposed) return;
                kind = "timer";
                handle = env.setTimeout(() => pump(), 0);
            });
        }
    }
    return {
        push(item) {
            if (disposed) return;
            queue.add(item);
            schedule();
        },
        dispose() {
            disposed = true;
            queue.clear();
            if (kind === "idle") env.cancelIdleCallback?.(handle);
            else if (kind === "frame") env.cancelAnimationFrame?.(handle);
            else if (kind === "timer") env.clearTimeout(handle);
        },
    };
}


/**
 * Frame-priority, deduplicated queue for small UI surfaces that must be translated
 * before their next paint. Keep this separate from idle batches: requestIdleCallback
 * may run after the user has already seen the original-language frame.
 */
export function createFrameBatchProcessor(processOne, env = globalThis) {
    const queue = new Set();
    let scheduled = false, disposed = false, handle, kind;

    function pump() {
        if (disposed) return;
        try {
            // A settings root is normally queued as one item. Drain the current frame's
            // work together so all text is ready before the browser paints that frame.
            const items = [...queue];
            queue.clear();
            for (const item of items) {
                if (disposed) break;
                try { processOne(item); } catch (error) { console.debug("[BCTP] DOM translation failed", error); }
            }
        } finally {
            scheduled = false;
            if (queue.size) schedule();
        }
    }

    function schedule() {
        if (scheduled || disposed) return;
        scheduled = true;
        if (typeof env.requestAnimationFrame === "function") {
            kind = "frame";
            handle = env.requestAnimationFrame(pump);
        } else {
            kind = "timer";
            handle = env.setTimeout(pump, 0);
        }
    }

    return {
        push(item) {
            if (disposed) return;
            queue.add(item);
            schedule();
        },
        dispose() {
            disposed = true;
            queue.clear();
            if (kind === "frame") env.cancelAnimationFrame?.(handle);
            else if (kind === "timer") env.clearTimeout?.(handle);
        },
    };
}
