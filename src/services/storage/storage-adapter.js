export function assertStorageAdapter(adapter) {
  for (const method of ["get", "set", "remove"]) {
    if (typeof adapter?.[method] !== "function") throw new TypeError(`El adaptador de almacenamiento debe implementar ${method}().`);
  }
  return adapter;
}
