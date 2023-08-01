import { Results, IFaceSolveOptions, TFace } from "../Types";
/** Class representing face solver. */
export declare class FaceSolver {
    /** expose blink stabilizer as a static method */
    static stabilizeBlink: (eye: Record<"r" | "l", number>, headY: number, { enableWink, maxRot, }?: {
        enableWink?: boolean | undefined;
        maxRot?: number | undefined;
    }) => {
        l: number;
        r: number;
    };
    /**
     * Combines head, eye, pupil, and eyebrow calcs into one method
     * @param {Results} lm : array of results from tfjs or mediapipe
     * @param {String} runtime: set as either "tfjs" or "mediapipe"
     * @param {IFaceSolveOptions} options: options for face solver
     */
    static solve(lm: Results, { runtime, video, imageSize, smoothBlink, blinkSettings, }?: Partial<IFaceSolveOptions>): TFace | undefined;
}
