import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { setCameraFollow } from './setCameraFollow';

export const fixedCameraBehindCharacter: Behavior = (entity: Entity, delta: any, args: any): void => {
  const follower = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent); // Camera
  // const cam = getComponent(entity, CameraComponent) as CameraComponent;
  // const camera = getMutableComponent<CameraComponent>(entity, CameraComponent); // Camera
  if(follower === undefined) return console.warn("Follower is undefined on switchCameraMode");
  if (follower.mode == 'thirdPersonLocked') {
    follower.mode = 'thirdPerson';
    Engine.camera.near = 0.1;
    // setCameraFollow(CameraComponent.instance.entity, null, delta, CameraComponent.instance.followTarget);
  } else {
    follower.mode = 'thirdPersonLocked';
    Engine.camera.near = 2;
   
  }
  
};
