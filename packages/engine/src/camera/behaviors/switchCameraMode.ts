import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';

/**
 * Switch Camera mode from first person to third person and wise versa.
 * @param entity Entity holding {@link camera/components/FollowCameraComponent.FollowCameraComponent | Follow camera} component.
 */
export const switchCameraMode: Behavior = (entity: Entity, args: any): void => {
  const follower = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent); // Camera
  const camera = getMutableComponent<CameraComponent>(entity, CameraComponent); // Camera
  if(follower === undefined) return console.warn("Follower is undefined on switchCameraMode");
  if (follower.mode == 'firstPerson') {
    follower.mode = 'thirdPerson';
    Engine.camera.near = 0.1;
  } else {
    follower.mode = 'firstPerson';
    Engine.camera.near = 2;
  }
};
