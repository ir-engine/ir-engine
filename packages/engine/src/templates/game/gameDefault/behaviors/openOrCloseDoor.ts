import { Entity } from '../../../../ecs/classes/Entity';
import { Behavior } from '../../../../common/interfaces/Behavior';
import { Vector3, Quaternion, Matrix4 } from 'three';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from "../../../../ecs/functions/EntityFunctions";
import { Closed } from "../components/ClosedTagComponent";
import { Open } from "../components/OpenTagComponent";

/**
 * @author HydraFire <github.com/HydraFire>
 */
let g = 2;

export const openOrCloseDoor: Behavior = (entity: Entity, args?: any, delta?: number, entityOther?: Entity, time?: number, checks?: any): void => {
   console.log('****** Door: ', args.action);

   let position = getMutableComponent(entityOther, TransformComponent).position;

   if(args.action === 'close') {
     removeComponent(entityOther, Open);
     addComponent(entityOther, Closed);
     position.set(
       position.x,
       position.y,
       position.z - g
     );
   } else if(args.action === 'open') {
     removeComponent(entityOther, Closed);
     addComponent(entityOther, Open);
     position.set(
       position.x,
       position.y,
       position.z + g
     );
   }
};
