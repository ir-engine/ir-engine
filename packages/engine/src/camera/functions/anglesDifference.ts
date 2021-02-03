
/**
 * Get the difference between 2 angles.
 * 
 * @param a First angle.
 * @param b Second angle.
 * @returns Difference between 2 angles.
 */
export function anglesDifference(a: number, b: number): number {
    if (a > 180) {
        a -= 360;
    }
    if (b > 180) {
        b -= 360;
    }

    return a - b;
} 