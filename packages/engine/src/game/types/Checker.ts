import { Entity } from '../../ecs/classes/Entity';

/** Type for Checker of Game Manager Modes Schema.
 * @author HydraFire <github.com/HydraFire>
 * @param entity Entity for which checker will be defined.
 * @param args Args for checker.
 * @param entitySecond Entity for second object which check will be.
 * @return object with result parameters of checker function, "undefined" will means thet check failed, not false - because "false" may be a result, for next
 */
export type Checker = (entity: Entity, args?: any, entityTarget?: Entity ) => boolean
