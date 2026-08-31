import { assertStorageAdapter } from "./storage-adapter.js";

export function createMemoryStorageAdapter(initialValues = {}) {
  const values = new Map(Object.entries(initialValues));
  return assertStorageAdapter({
    get: (key) => values.get(key) ?? null,
    set: (key, value) => values.set(key, value),
    remove: (key) => values.delete(key)
  });
}
