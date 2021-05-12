import { Behavior } from '../../../../common/interfaces/Behavior';
import { Entity } from '../../../../ecs/classes/Entity';
import { getMutableComponent } from "../../../../ecs/functions/EntityFunctions";
import { addStateComponent, removeStateComponent } from '../../../../game/functions/functionsState';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { ButtonDown } from "../components/ButtonDownTagComponent";
import { ButtonUp } from "../components/ButtonUpTagComponent";


/**
 * @author HydraFire <github.com/HydraFire>
 */

 const g = 0.1;

export const upDownButton: Behavior = (entity: Entity, args?: any, delta?: number, entityOther?: Entity, time?: number, checks?: any): void => {
  console.log('****** Button: ', args.action);

  const position = getMutableComponent(entity, TransformComponent).position;

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
