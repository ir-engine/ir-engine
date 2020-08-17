import { Entity } from "../../ecs/classes/Entity";
export interface Behavior {
    (entity: Entity, args?: any, delta?: number, entityOut?: Entity, time?: number): void;
}
