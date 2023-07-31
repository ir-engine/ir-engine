import { Results, THand, Side } from "../Types";
/** Class representing hand solver. */
export declare class HandSolver {
    /**
     * Calculates finger and wrist as euler rotations
     * @param {Array} lm : array of 3D hand vectors from tfjs or mediapipe
     * @param {Side} side: left or right
     */
    static solve(lm: Results, side?: Side): THand<typeof side> | undefined;
}
