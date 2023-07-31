import { RestingDefault } from "../utils/helpers";
import { calcArms } from "./calcArms";
import { calcHips } from "./calcHips";
import { calcLegs } from "./calcLegs";
/** Class representing pose solver. */
export class PoseSolver {
    /**
     * Combines arm, hips, and leg calcs into one method
     * @param {Array} lm3d : array of 3D pose vectors from tfjs or mediapipe
     * @param {Array} lm2d : array of 2D pose vectors from tfjs or mediapipe
     * @param {String} runtime: set as either "tfjs" or "mediapipe"
     * @param {IPoseSolveOptions} options: options object
     */
    static solve(lm3d, lm2d, { runtime = "mediapipe", video = null, imageSize = null, enableLegs = true } = {}) {
        var _a, _b, _c, _d;
        if (!lm3d && !lm2d) {
            console.error("Need both World Pose and Pose Landmarks");
            return;
        }
        // format and normalize values given by tfjs output
        if (video) {
            const videoEl = (typeof video === "string" ? document.querySelector(video) : video);
            imageSize = {
                width: videoEl.videoWidth,
                height: videoEl.videoHeight,
            };
        }
        if (runtime === "tfjs" && imageSize) {
            for (const e of lm3d) {
                e.visibility = e.score;
            }
            for (const e of lm2d) {
                e.x /= imageSize.width;
                e.y /= imageSize.height;
                e.z = 0;
                e.visibility = e.score;
            }
        }
        const Arms = calcArms(lm3d);
        const Hips = calcHips(lm3d, lm2d);
        const Legs = enableLegs ? calcLegs(lm3d) : null;
        //DETECT OFFSCREEN AND RESET VALUES TO DEFAULTS
        const rightHandOffscreen = lm3d[15].y > 0.1 || ((_a = lm3d[15].visibility) !== null && _a !== void 0 ? _a : 0) < 0.23 || 0.995 < lm2d[15].y;
        const leftHandOffscreen = lm3d[16].y > 0.1 || ((_b = lm3d[16].visibility) !== null && _b !== void 0 ? _b : 0) < 0.23 || 0.995 < lm2d[16].y;
        const leftFootOffscreen = lm3d[23].y > 0.1 || ((_c = lm3d[23].visibility) !== null && _c !== void 0 ? _c : 0) < 0.63 || Hips.Hips.position.z > -0.4;
        const rightFootOffscreen = lm3d[24].y > 0.1 || ((_d = lm3d[24].visibility) !== null && _d !== void 0 ? _d : 0) < 0.63 || Hips.Hips.position.z > -0.4;
        Arms.UpperArm.l = Arms.UpperArm.l.multiply(leftHandOffscreen ? 0 : 1);
        Arms.UpperArm.l.z = leftHandOffscreen ? RestingDefault.Pose.LeftUpperArm.z : Arms.UpperArm.l.z;
        Arms.UpperArm.r = Arms.UpperArm.r.multiply(rightHandOffscreen ? 0 : 1);
        Arms.UpperArm.r.z = rightHandOffscreen ? RestingDefault.Pose.RightUpperArm.z : Arms.UpperArm.r.z;
        Arms.LowerArm.l = Arms.LowerArm.l.multiply(leftHandOffscreen ? 0 : 1);
        Arms.LowerArm.r = Arms.LowerArm.r.multiply(rightHandOffscreen ? 0 : 1);
        Arms.Hand.l = Arms.Hand.l.multiply(leftHandOffscreen ? 0 : 1);
        Arms.Hand.r = Arms.Hand.r.multiply(rightHandOffscreen ? 0 : 1);
        //skip calculations if disable legs
        if (Legs) {
            Legs.UpperLeg.l = Legs.UpperLeg.l.multiply(rightFootOffscreen ? 0 : 1);
            Legs.UpperLeg.r = Legs.UpperLeg.r.multiply(leftFootOffscreen ? 0 : 1);
            Legs.LowerLeg.l = Legs.LowerLeg.l.multiply(rightFootOffscreen ? 0 : 1);
            Legs.LowerLeg.r = Legs.LowerLeg.r.multiply(leftFootOffscreen ? 0 : 1);
        }
        return {
            RightUpperArm: Arms.UpperArm.r,
            RightLowerArm: Arms.LowerArm.r,
            LeftUpperArm: Arms.UpperArm.l,
            LeftLowerArm: Arms.LowerArm.l,
            RightHand: Arms.Hand.r,
            LeftHand: Arms.Hand.l,
            RightUpperLeg: Legs ? Legs.UpperLeg.r : RestingDefault.Pose.RightUpperLeg,
            RightLowerLeg: Legs ? Legs.LowerLeg.r : RestingDefault.Pose.RightLowerLeg,
            LeftUpperLeg: Legs ? Legs.UpperLeg.l : RestingDefault.Pose.LeftUpperLeg,
            LeftLowerLeg: Legs ? Legs.LowerLeg.l : RestingDefault.Pose.LeftLowerLeg,
            Hips: Hips.Hips,
            Spine: Hips.Spine,
        };
    }
}
/** expose arm rotation calculator as a static method */
PoseSolver.calcArms = calcArms;
/** expose hips position and rotation calculator as a static method */
PoseSolver.calcHips = calcHips;
/** expose leg rotation calculator as a static method */
PoseSolver.calcLegs = calcLegs;
