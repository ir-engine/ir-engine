import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent } from '../../../../ecs/functions/EntityFunctions';
import { Checker } from '../../../../game/types/Checker';
import { Interactable } from "../../../../interaction/components/Interactable";
import { getTargetEntity } from '../../../../game/functions/functions';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const ifNamed: Checker = (entity: Entity, args?: any, entityTarget?: Entity ): any | undefined => {
   const entityArg = getTargetEntity(entity, entityTarget, args);
   const nameObject = getComponent(entityArg, Interactable).data.interactionText;
   console.warn(args.name === nameObject);
   if (args.name === undefined) {
     console.warn('ifNamed, you must give argument name:');
     return false;
   } else if (nameObject === undefined) {
     console.warn('ifNamed, you must give in editor interactionText, its will be name of object');
     return false;
   }

   return args.name === nameObject;
};
