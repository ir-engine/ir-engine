import { Entity } from "../../ecs/classes/Entity";

export type InteractionCheckHandler = (clientEntity: Entity, interactiveEntity: Entity) => boolean
export type InteractBehaviorArguments = { interactive: Entity[] }