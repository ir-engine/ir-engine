import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DesiredTransformComponent } from '../../transform/components/DesiredTransformComponent';
import { setCameraFollow } from './setCameraFollow';
import { CameraModes } from '../types/CameraModes'

/**
 * Fix camera behind the character to follow the character.
 * @param entity Entity on which camera will be fixed.
 */
export const fixedCameraBehindCharacter: Behavior = (entity: Entity, args: any, delta: number): void => {
  const follower = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent);

  if (CameraComponent.instance && follower && follower.mode !== CameraModes.FirstPerson) {
    follower.locked = !follower.locked
    // follower.needsReset = follower.locked
    // setCameraFollow(CameraComponent.instance.entity, { forceRefresh: true }, delta, CameraComponent.instance.followTarget);
  }
  
};
