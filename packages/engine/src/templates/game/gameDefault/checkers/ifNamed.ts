import { Entity } from '../../../../ecs/classes/Entity';
import { Checker } from '../../../../game/types/Checker';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const ifNamed: Checker = (entity: Entity, args?: any, entitySecond?: Entity ): any | undefined => {
   // name ===  args.name
   console.log('****** ifNamed: ', args, entitySecond);
   return { name: 'test'};
};
