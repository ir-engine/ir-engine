import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';



export const switchCameraMode: Behavior = (entity: Entity, args: any): void => {
  const follower = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent); // Camera
  const camera = getMutableComponent<CameraComponent>(entity, CameraComponent); // Camera
  if(follower === undefined) return console.warn("Follower is undefined on switchCameraMode");
  if (follower.mode == 'firstPerson') {
    follower.mode = 'thirdPerson'
    Engine.camera.near = 0.1
  } else {
    follower.mode = 'firstPerson'
    Engine.camera.near = 2
  }
};
