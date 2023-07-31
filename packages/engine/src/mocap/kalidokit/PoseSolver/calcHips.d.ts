import Vector from "../utils/vector";
import { IHips, XYZ, TFVectorPose } from "../Types";
/**
 * Calculates Hip rotation and world position
 * @param {Array} lm3d : array of 3D pose vectors from tfjs or mediapipe
 * @param {Array} lm2d : array of 2D pose vectors from tfjs or mediapipe
 */
export declare const calcHips: (lm3d: TFVectorPose, lm2d: Omit<TFVectorPose, "z">) => {
    Hips: IHips;
    Spine: XYZ;
};
/**
 * Converts normalized rotations to radians and estimates world position of hips
 * @param {Object} hips : hip position and rotation values
 * @param {Object} spine : spine position and rotation values
 */
export declare const rigHips: (hips: IHips, spine: Vector | XYZ) => {
    Hips: IHips;
    Spine: XYZ;
};
