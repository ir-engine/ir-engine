import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent, hasComponent } from '../../../../ecs/functions/EntityFunctions';
import { Checker } from '../../../../game/types/Checker';
import { GamePlayer } from "../../../../game/components/GamePlayer";
import { GameObject } from "../../../../game/components/GameObject";
import { NetworkObject } from '../../../../networking/components/NetworkObject';
import { getTargetEntity } from '../../../../game/functions/functions';
import { ColliderComponent } from '../../../../physics/components/ColliderComponent';

/**
 * @author HydraFire <github.com/HydraFire>
 */

export const ifMoved: Checker = (entity: Entity, args?: any, entityTarget?: Entity ): any | undefined => {
   if (hasComponent(entity, ColliderComponent)) {
      const collider = getComponent(entity, ColliderComponent);
      
      if (args.max && collider.velocity.length() >= args.max) {        
      //   console.log(collider.velocity.length()); 
         return true;
      }
      if (args.min && collider.velocity.length() <= args.min) {
          
         return true;
      }
   }
   return false;
};
