/**
 * convert value to range x: -1, 1 and y: -1, 1
 * @param x
 * @param y
 * @param elementWidth
 * @param elementHeight
 */
export function normalizeMouseCoordinates(x: number, y: number, elementWidth: number, elementHeight: number): { x: number, y: number } {
  return {
    x: (x / elementWidth) * 2 - 1,
    y: (y / elementHeight) * -2 + 1
  }
}