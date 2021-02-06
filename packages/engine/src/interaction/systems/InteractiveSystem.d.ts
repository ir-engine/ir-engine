import { System, SystemAttributes } from "../../ecs/classes/System";
import { Entity } from "../../ecs/classes/Entity";
import { SystemUpdateType } from "../../ecs/functions/SystemUpdateType";
import { Vector3 } from "three";
export declare class InteractiveSystem extends System {
    updateType: SystemUpdateType;
    /**
     * Elements that was in focused state on last execution
     */
    focused: Set<Entity>;
    /**
     * Elements that are focused on current execution
     */
    newFocused: Set<Entity>;
    previousEntity: Entity;
    previousEntity2DPosition: Vector3;
    constructor(attributes?: SystemAttributes);
    dispose(): void;
    execute(delta: number, time: number): void;
    static queries: any;
}
