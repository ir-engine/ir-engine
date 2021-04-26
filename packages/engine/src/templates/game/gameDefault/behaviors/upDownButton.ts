import { Entity } from '../../../../ecs/classes/Entity';
import { Behavior } from '../../../../common/interfaces/Behavior';
import { addComponent, getComponent, getMutableComponent, hasComponent, removeComponent } from "../../../../ecs/functions/EntityFunctions";
import { Vector3, Quaternion, Matrix4 } from 'three';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { ButtonUp } from "../components/ButtonUpTagComponent";
import { ButtonDown } from "../components/ButtonDownTagComponent";


import { initState, saveInitStateCopy, reInitState, sendState, requireState, applyStateToClient, correctState, addStateComponent, removeStateComponent  } from '../../../../game/functions/functionsState';
import { initStorage, getStorage } from '../../../../game/functions/functionsStorage';
/**
 * @author HydraFire <github.com/HydraFire>
 */

 let g = 0.1;

export const upDownButton: Behavior = (entity: Entity, args?: any, delta?: number, entityOther?: Entity, time?: number, checks?: any): void => {
  console.log('****** Button: ', args.action);

  let position = getMutableComponent(entity, TransformComponent).position;

  if(args.action === 'down') {
    removeStateComponent(entity, ButtonUp);
    addStateComponent(entity, ButtonDown);
    position.set(
      position.x,
      position.y - g,
      position.z
    );
  } else if(args.action === 'up') {
    removeStateComponent(entity, ButtonDown);
    addStateComponent(entity, ButtonUp);
    position.set(
      position.x,
      position.y + g,
      position.z
    );
  }
};
