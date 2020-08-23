import { Behavior } from '../../common/interfaces/Behavior';
import { TransformComponent } from '../components/TransformComponent';
import { Entity } from '../../ecs/classes/Entity';
import { getMutableComponent, getComponent } from '../../ecs/functions/EntityFunctions';

let follower, target;

export const followTarget: Behavior = (entityIn: Entity, args: any, delta: any, entityOut: Entity): void => {
  follower = getMutableComponent<TransformComponent>(entityIn, TransformComponent); // Camera
  target = getComponent<TransformComponent>(entityOut, TransformComponent); // Player

  target.position[1] = 2
  follower.copy(target);

};
