import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DesiredTransformComponent } from '../../transform/components/DesiredTransformComponent';
import { setCameraFollow } from './setCameraFollow';

/**
 * Fix camera behind the character to follow the character.
 * @param entity Entity on which camera will be fixed.
 */
export const fixedCameraBehindCharacter: Behavior = (entity: Entity, args: any, delta: number): void => {
  const follower = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent); // Camera
  
  if(follower === undefined) return console.warn("Follower is undefined on switchCameraMode");
  if (follower.mode == 'thirdPersonLocked') {
    follower.mode = 'thirdPerson';
    Engine.camera.near = 0.1; 
  } else {
    follower.mode = 'thirdPersonLocked';
    const cameraTargetTransform = getMutableComponent (CameraComponent.instance.entity, DesiredTransformComponent); // Camera
    cameraTargetTransform.positionRate = 1.5;
    Engine.camera.near = 2;
    setCameraFollow(CameraComponent.instance.entity, {forceRefresh: true}, delta, CameraComponent.instance.followTarget);
  }
  
};
