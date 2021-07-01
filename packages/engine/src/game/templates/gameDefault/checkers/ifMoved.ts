import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions';
import { Checker } from '../../../../game/types/Checker';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const ifMoved: Checker = (entity: Entity, args?: any, entityTarget?: Entity ): any | undefined => {
   if (hasComponent(entity, ColliderComponent)) {
      const collider = getComponent(entity, ColliderComponent);

      const velocity = collider.velocity.length()
      // console.log(velocity)
      
      return (args.max && velocity >= args.max) || (args.min && velocity <= args.min)
   }
   return false;
};
