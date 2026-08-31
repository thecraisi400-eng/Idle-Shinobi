export function nowIso(clock = Date) {
  return new clock().toISOString();
}
