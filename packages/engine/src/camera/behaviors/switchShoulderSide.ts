import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';

export const switchShoulderSide: Behavior = (entity: Entity, args: any, detla: number ): void => {
  const cameraFollow = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent);
  if(cameraFollow) {
    cameraFollow.shoulderSide = !cameraFollow.shoulderSide;
    cameraFollow.offset.x = -cameraFollow.offset.x;
  }
};