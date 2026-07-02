import { createJSONStorage } from "zustand/middleware";

/**
 * Stores use `skipHydration: true` + this storage factory so the module's
 * initial (seed) state is what both the server render and the client's
 * first hydration pass use — real localStorage is only read afterwards via
 * an explicit `.persist.rehydrate()` call in <StoreHydrator>. This avoids
 * SSR crashes (no `localStorage` on the server) and hydration mismatches.
 */
export function safeStorage<T>() {
  return createJSONStorage<T>(() =>
    typeof window !== "undefined"
      ? window.localStorage
      : (undefined as unknown as Storage),
  );
}
