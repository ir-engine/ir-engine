import { Quaternion } from "cannon-es/src/math/Quaternion";
import { System } from "../../ecs/classes/System";
export declare const quaternion: Quaternion;
export declare class PhysicsSystem extends System {
    init(): void;
    execute(dt: any, t: any): void;
}
