import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { CameraModes } from '../types/CameraModes';
import { switchCameraMode } from './switchCameraMode';

/**
 * Switch Camera mode from first person to third person and wise versa.
 * @param entity Entity holding {@link camera/components/FollowCameraComponent.FollowCameraComponent | Follow camera} component.
 */
export const cycleCameraMode: Behavior = (entity: Entity, args: any): void => {
  const cameraFollow = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent);

    switch(cameraFollow?.mode) {
        case CameraModes.FirstPerson: switchCameraMode(entity, { mode: CameraModes.ShoulderCam }); break;
        case CameraModes.ShoulderCam: switchCameraMode(entity, { mode: CameraModes.ThirdPerson }); cameraFollow.distance = cameraFollow.minDistance + 1; break;
        case CameraModes.ThirdPerson: switchCameraMode(entity, { mode: CameraModes.TopDown }); break;
        case CameraModes.TopDown: switchCameraMode(entity, { mode: CameraModes.FirstPerson }); break;
        default: break;
    }
};