import { System } from "../../ecs/classes/System";
import { Entity } from "../../ecs/classes/Entity";
export default class AssetLoadingSystem extends System {
    loaded: Map<Entity, any>;
    init(): void;
    execute(): void;
}
export declare function hashResourceString(str: any): string;
