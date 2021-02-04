import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { CameraModes } from "../types/CameraModes";
import { cameraPointerLock } from './cameraPointerLock';

export const switchCameraMode = (cameraFollow: FollowCameraComponent, args: any): void => {
    
  cameraFollow.mode = args.mode

  switch(args.mode) {
    case CameraModes.FirstPerson: {
        cameraPointerLock(true);
        Engine.camera.near = 0.1; 
        cameraFollow.offset.set(0, 1, 0);
        cameraFollow.phi = 45;
    } break;

    case CameraModes.ShoulderCam: {
        cameraPointerLock(true);
        Engine.camera.near = 2; 
        cameraFollow.offset.set(1, 1, 0);
    } break;

    default: case CameraModes.ThirdPerson: {
        cameraPointerLock(false);
        cameraFollow.offset.set(0, 1, 0);
    } break;

    case CameraModes.TopDown: {
        cameraPointerLock(false);
        cameraFollow.offset.set(0, 1, 0);
    } break;
  }
};