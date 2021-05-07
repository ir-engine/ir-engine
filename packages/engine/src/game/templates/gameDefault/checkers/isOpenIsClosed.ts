import { Entity } from '../../../../ecs/classes/Entity';
import { Checker } from '../../../../game/types/Checker';
import { getComponent } from '../../../../ecs/functions/EntityFunctions';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
import { getStorage } from '../../../../game/functions/functionsStorage';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const isOpen: Checker = (entity: Entity, args?: any, entityTarget?: Entity): any => {
  const position = getComponent(entity, TransformComponent).position;
  const positionStart = getStorage(entity, TransformComponent).position;
  const differensNow = Math.abs(positionStart.z - position.z);

  if (args.diff >= differensNow) {
    return undefined;
  } else {
    return differensNow;
  }
};

export const isClosed: Checker = (entity: Entity, args?: any, entityTarget?: Entity): any => {
  const position = getComponent(entity, TransformComponent).position;
  const positionStart = getStorage(entity, TransformComponent).position;
  const differensNow = Math.abs(positionStart.z - position.z);
  //      2     >    1.5  = Opened
  //      2     <    2.1  = Closed
  if (args.diff >= differensNow) {
    return differensNow;
  } else {
    return undefined;
  }
};
