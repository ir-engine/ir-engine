import { Entity } from "../../ecs/classes/Entity";
interface XYZInterface {
    x: number;
    y: number;
    z: number;
}
export declare function createTransformComponent(entity: Entity, args: {
    objArgs: {
        position: XYZInterface;
        rotation: XYZInterface;
        scale: XYZInterface;
    };
}): void;
export {};
