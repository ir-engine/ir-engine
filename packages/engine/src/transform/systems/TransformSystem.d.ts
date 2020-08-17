import { Behavior } from "../../common/interfaces/Behavior";
import { System, Attributes } from "../../ecs/classes/System";
export declare class TransformSystem extends System {
    transformBehavior: Behavior;
    childTransformBehavior: Behavior;
    init(attributes: Attributes): void;
    execute(delta: any, time: any): void;
}
