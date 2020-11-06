import { Entity } from "../../ecs/classes/Entity";

// TODO: make it Behavior compatible?
export type InteractionCheckHandler = (clientEntity: Entity, interactiveEntity: Entity) => boolean
export type InteractBehaviorArguments = { interactive: Entity[] }