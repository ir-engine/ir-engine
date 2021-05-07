import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent } from '../../../../ecs/functions/EntityFunctions';
import { getStorage } from '../../../../game/functions/functionsStorage';
import { Checker } from '../../../../game/types/Checker';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const isUp: Checker = (entity: Entity, args?: any, entityTarget?: Entity): any => {
  const position = getComponent(entity, TransformComponent).position;
  const positionStart = getStorage(entity, TransformComponent).position;
  const differensNow = Math.abs(positionStart.y - position.y);

  if (args.diff >= differensNow) {
    return undefined;
  } else {
    return differensNow;
  }
};

export const isDown: Checker = (entity: Entity, args?: any, entityTarget?: Entity): any => {
  const position = getComponent(entity, TransformComponent).position;
  const positionStart = getStorage(entity, TransformComponent).position;
  const differensNow = Math.abs(positionStart.y - position.y);
  //      2     >    1.5  = Opened
  //      2     <    2.1  = Closed
  if (args.diff >= differensNow) {
    return differensNow;
  } else {
    return undefined;
  }
};
