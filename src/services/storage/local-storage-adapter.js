import { assertStorageAdapter } from "./storage-adapter.js";

export function createLocalStorageAdapter(storage = globalThis.localStorage) {
  if (!storage) throw new Error("localStorage no está disponible en este entorno.");
  return assertStorageAdapter({
    get: (key) => storage.getItem(key),
    set: (key, value) => storage.setItem(key, value),
    remove: (key) => storage.removeItem(key)
  });
}
