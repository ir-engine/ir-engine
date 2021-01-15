
export function anglesDifference(a: number, b: number): number {
    if (a > 180) {
        a -= 360;
    }
    if (b > 180) {
        b -= 360;
    }

    return a - b;
} 