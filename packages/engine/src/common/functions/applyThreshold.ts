/**
 * Apply Threshold on the number.
 * @param value Number on which threshold will be applied. Must be between -1 to 1 inclusive.
 * @param threshold Threshold value. Must be between 0 to 1 inclusive.
 *
 * @returns Threshold Value.
 */
export function applyThreshold(value: number, threshold: number): number {
  if (threshold >= 1) {
    return 0
  }
  if (value < threshold && value > -threshold) {
    return 0
  }

  return (Math.sign(value) * (Math.abs(value) - threshold)) / (1 - threshold)
}
