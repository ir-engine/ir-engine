import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getMutableComponent, hasComponent } from "../../../../ecs/functions/EntityFunctions";
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { Closed } from "../components/ClosedTagComponent";
import { Open } from "../components/OpenTagComponent";


/**
 * @author HydraFire <github.com/HydraFire>
 */

export const giveOpenOrCloseState: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  let target;
  if (args.on === 'me') {
    target = entity;
  } else if (args.on === 'target') {
    target = entityTarget;
  } else {
    console.warn('giveOpenOrCloseState, you must give argument on: me, or on: target');
    return;
  }
  if(hasComponent(target, Open)) {
   removeStateComponent(target, Open);
   addStateComponent(target, Closed);
  } else if(hasComponent(target, Closed)) {
   removeStateComponent(target, Closed);
   addStateComponent(target, Open);
  }
};

export const doorOpeningOrClosing: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const position = getMutableComponent(entity, TransformComponent).position;
  const animSpeed = args.animationSpeed ?? 1;
  if(args.action === 'opening') {
    //storage.position =
    position.set(
     position.x,
     position.y,
     position.z - (delta * animSpeed) // delta = 0.024
    );
  } else if(args.action === 'closing') {
    position.set(
     position.x,
     position.y,
     position.z + (delta * animSpeed)
    );
  }
};
