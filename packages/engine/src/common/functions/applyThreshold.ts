/**
 *
 * @param value -1 to 1
 * @param threshold 0 to 1
 */

export function applyThreshold (value: number, threshold: number): number {
  if (threshold >= 1) {
    return 0;
  }
  if (value < threshold && value > -threshold) {
    return 0;
  }

  return (Math.sign(value) * (Math.abs(value) - threshold)) / (1 - threshold);
}
