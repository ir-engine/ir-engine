import { Vector3 } from "three";
interface AnimationWeightScaleInterface {
    weight: number;
    timeScale: number;
}
export declare const getMovingAnimationsByVelocity: (localSpaceVelocity: Vector3) => Map<number, AnimationWeightScaleInterface>;
export {};
