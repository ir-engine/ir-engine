import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getMutableComponent, hasComponent } from "../../../../ecs/functions/EntityFunctions";
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { PanelDown } from "../components/PanelDownTagComponent";
import { PanelUp } from "../components/PanelUpTagComponent";


/**
 * @author HydraFire <github.com/HydraFire>
 */

export const giveUpOrDownState: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  let target;
  if (args.on === 'me') {
    target = entity;
  } else if (args.on === 'target') {
    target = entityTarget;
  } else {
    console.warn('giveOpenOrCloseState, you must give argument on: me, or on: target');
    return;
  }

  if(args.give === 'down' && hasComponent(target, PanelUp)) {
   removeStateComponent(target, PanelUp);
   addStateComponent(target, PanelDown);

 } else if(args.give === 'up' && hasComponent(target, PanelDown)) {
   removeStateComponent(target, PanelDown);
   addStateComponent(target, PanelUp);
  }
};

export const upDownPanel: Behavior = (entity: Entity, args?: any, delta?: number, entityTarget?: Entity, time?: number, checks?: any): void => {
  const position = getMutableComponent(entity, TransformComponent).position;
  const animSpeed = args.animationSpeed ?? 1;
  if(args.action === 'down') {
    //storage.position =
    position.set(
     position.x,
     position.y - (delta * animSpeed),
     position.z  // delta = 0.024
    );
  } else if(args.action === 'up') {
    position.set(
     position.x,
     position.y + (delta * animSpeed),
     position.z
    );
  }
};
