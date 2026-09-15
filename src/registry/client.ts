import { getCachedRegistry, saveRegistry } from "./cache.js";
import { CACHE_DURATION, REGISTRY_URL } from "./config.js";
import type { Registry } from "./types.js";

export async function loadRegistry(): Promise<Registry> {
  try {
    const response = await fetch(REGISTRY_URL);

    if (!response.ok) {
      throw new Error("Registry unavailable");
    }

    const data = await response.json();

    saveRegistry(data);

    return data;
  } catch (error) {
    const cached = getCachedRegistry();

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      return cached.data;
    }

    throw error;
  }
}

export async function loadStarters() {
  const registry = await loadRegistry();
  return registry.starters;
}
