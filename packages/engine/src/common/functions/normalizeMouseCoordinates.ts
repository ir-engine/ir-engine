/**
 * Normalize coordinates and set the range of coordinates between -1 to 1.
 * @param x
 * @param y
 * @param elementWidth
 * @param elementHeight
 * @returns Normalized Mouse coordinates (x, y) where x and y are between -1 to 1 inclusively.
 */
export function normalizeMouseCoordinates(x: number, y: number, elementWidth: number, elementHeight: number): { x: number; y: number } {
  return {
    x: (x / elementWidth) * 2 - 1,
    y: (y / elementHeight) * -2 + 1
  };
}
