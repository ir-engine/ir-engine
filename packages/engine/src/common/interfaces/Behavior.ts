import { Entity } from '../../ecs/classes/Entity';

export type Behavior = (entity: Entity, args?: any, delta?: number, entityOut?: Entity, time?: number) => void
