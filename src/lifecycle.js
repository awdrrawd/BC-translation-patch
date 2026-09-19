/** Collect cleanup as each resource is created, including partial initialization. */
export function createScope() {
    const tasks = [];
    let disposed = false;
    return {
        add(cleanup) {
            if (typeof cleanup !== "function") return;
            if (disposed) cleanup();
            else tasks.push(cleanup);
        },
        dispose() {
            if (disposed) return;
            disposed = true;
            for (const cleanup of tasks.reverse()) {
                try { cleanup(); } catch (error) { console.debug("[BCTP] Cleanup failed", error); }
            }
            tasks.length = 0;
        },
    };
}

/** Retry failed starts; concurrent loads share the same initialization promise. */
export function startOnce(g, initialize) {
    g.Liko ??= {};
    const old = g.Liko.__Sys_VanillaTranslation__;
    if (old && old.status !== "failed") return old.promise ?? Promise.resolve(old);
    const state = { status: "loading", phase: "starting", loading: true,
        retry: () => startOnce(g, initialize) };
    g.Liko.__Sys_VanillaTranslation__ = state;
    g.BCTP = state;
    state.promise = Promise.resolve().then(() => initialize(state)).then(api => {
        Object.assign(state, api, { status: "ready", phase: "ready", loading: false });
        g.BCTP = state;
        return state;
    }).catch(error => {
        Object.assign(state, { status: "failed", loading: false, error });
        throw error;
    });
    return state.promise;
}
