import { Entity } from '../../../../ecs/classes/Entity';
import { Behavior } from '../../../../common/interfaces/Behavior';
import { Vector3, Quaternion, Matrix4 } from 'three';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from "../../../../ecs/functions/EntityFunctions";
import { Closed } from "../components/ClosedTagComponent";
import { Open } from "../components/OpenTagComponent";

import { initState, saveInitStateCopy, reInitState, sendState, requireState, applyStateToClient, correctState, addStateComponent, removeStateComponent  } from '../../../../game/functions/functionsState';
import { initStorage, getStorage } from '../../../../game/functions/functionsStorage';

/**
 * @author HydraFire <github.com/HydraFire>
 */
let g = 2;

export const openOrCloseDoor: Behavior = (entity: Entity, args?: any, delta?: number, entityOther?: Entity, time?: number, checks?: any): void => {
   console.log('****** Door: ', args.action);

   let position = getMutableComponent(entityOther, TransformComponent).position;

   if(args.action === 'close') {
     removeStateComponent(entityOther, Open);
     addStateComponent(entityOther, Closed);
     position.set(
       position.x,
       position.y,
       position.z - g
     );
   } else if(args.action === 'open') {
     removeStateComponent(entityOther, Closed);
     addStateComponent(entityOther, Open);
     position.set(
       position.x,
       position.y,
       position.z + g
     );
   }
};
