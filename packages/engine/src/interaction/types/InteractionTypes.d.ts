import { Entity } from "../../ecs/classes/Entity";
export declare type InteractionCheckHandler = (clientEntity: Entity, interactiveEntity: Entity) => boolean;
export declare type InteractBehaviorArguments = {
    interactive: Entity[];
};
