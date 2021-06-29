import { Entity } from '../../ecs/classes/Entity';

/** Type for Behavior of different components.
 * @param entity Entity for which behavior will be defined.
 * @param args Args for behavior.
 * @param delta Time since last frame.
 * @param entityOut
 * @param time
 */
export type Behavior<Args=any> = (entity: Entity, args?: Args, delta?: number, entityOut?: Entity, time?: number, checks?: any) => void
