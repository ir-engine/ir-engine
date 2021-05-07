import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent } from '../../../../ecs/functions/EntityFunctions';
import { Checker } from '../../../../game/types/Checker';
import { Interactable } from "../../../../interaction/components/Interactable";
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const ifNamed: Checker = (entity: Entity, args?: any, entityTarget?: Entity ): any | undefined => {
   // name ===  args.name
   let nameObject;
   if (args.on === 'me') {
     nameObject = getComponent(entity, Interactable).data.interactionText;
   } else if (args.on === 'target') {
     nameObject = getComponent(entityTarget, Interactable).data.interactionText;
   } else {
     console.warn('ifNamed, you must give argument on: me, or on: target');
     return undefined;
   }

   if (args.name === undefined) {
     console.warn('ifNamed, you must give argument name:');
     return undefined;
   } else if (nameObject === undefined) {
     console.warn('ifNamed, you must give in editor interactionText, its will be name of object');
     return undefined;
   }

   if (args.name === nameObject) {
     return { name: nameObject };
   } else {
     return undefined;
   }
};
