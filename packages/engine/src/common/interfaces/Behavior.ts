import { Entity } from '../../ecs/classes/Entity';

/** Type for Behavior of different components.
 * @param entity Entity for which behavior will be defined.
 * @param args Args for behavior.
 * @param delta
 * @param entityOut
 * @param time
 */
export type Behavior = (entity: Entity, args?: any, delta?: number, entityOut?: Entity, time?: number) => void
