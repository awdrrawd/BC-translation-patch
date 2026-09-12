// Static imports here must remain free of dictionaries and startup side effects.
import { startOnce } from "./lifecycle.js";

startOnce(globalThis, async state => {
    const { init } = await import("./app.js");
    return init(state);
}).catch(error => console.error("🐈‍⬛ [BCTP] Failed to load; loading again will retry:", error));
