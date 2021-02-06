/**
 * Normalize mouse movement and set the range of coordinates between 0 to 2.
 * @param x
 * @param y
 * @param elementWidth
 * @param elementHeight
 * @returns Normalized Mouse movement (x, y) where x and y are between 0 to 2 inclusively.
 */
export declare function normalizeMouseMovement(x: number, y: number, elementWidth: number, elementHeight: number): {
    x: number;
    y: number;
};
