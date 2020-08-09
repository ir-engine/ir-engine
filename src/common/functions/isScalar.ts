export function isScalar(value: unknown): boolean {
  if (typeof value !== "number" || value !== Number(value) || Number.isFinite(value) === false) return false
  return true
}
