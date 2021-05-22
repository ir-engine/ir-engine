import { Entity } from '../../../../ecs/classes/Entity';
import { getComponent } from '../../../../ecs/functions/EntityFunctions';
import { getStorage } from '../../../../game/functions/functionsStorage';
import { Checker } from '../../../../game/types/Checker';
import { TransformComponent } from '../../../../transform/components/TransformComponent';
/**
 * @author HydraFire <github.com/HydraFire>
 */

export const isDifferent: Checker = (entity: Entity, args?: any, entityTarget?: Entity): boolean => {
  const position = getComponent(entity, TransformComponent).position;
  const positionStart = getStorage(entity, TransformComponent).position;
  const chooseMinOrMax = (args.min != undefined && args.min != null && args.max === undefined) ? 'min' : (args.max != undefined && args.max != null && args.min === undefined) ? 'max' : console.error('need arg.max: 3, or rg.max: 0.1, but not both in one args');
  const value = args[chooseMinOrMax];
  const differensNow = Math.abs(positionStart.x - position.x) + Math.abs(positionStart.y - position.y) + Math.abs(positionStart.z - position.z);
  return chooseMinOrMax === 'min' ? value < differensNow : value > differensNow;
};
