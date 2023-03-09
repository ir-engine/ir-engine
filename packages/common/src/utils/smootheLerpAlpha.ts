/**
 * Create a lerp alpha value that is exponentially smoothed.
 * @param lerpMultiplier
 * @param deltaSeconds
 * @returns
 */
export function smootheLerpAlpha(lerpMultiplier: number, deltaSeconds: number) {
  return 1 - Math.exp(-lerpMultiplier * deltaSeconds)
}
