import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { Engine } from '@xr3ngine/engine/src/ecs/classes/Engine';
import { Entity } from '../../ecs/classes/Entity';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { setVisible } from '../../templates/character/functions/setVisible';
import { CameraModes } from "../types/CameraModes";
import { cameraPointerLock } from './cameraPointerLock';

export const switchCameraMode = (entity: Entity, args: any = { pointerLock: false, mode: CameraModes.ThirdPerson }): void => {
  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

  const cameraFollow = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent);
  cameraFollow.mode = args.mode

  switch(args.mode) {
    case CameraModes.FirstPerson: {
      args.pointerLock && cameraPointerLock(true);
      cameraFollow.offset.set(0, 1, 0);
      cameraFollow.phi = 45;
      setVisible(actor, false);
    } break;

    case CameraModes.ShoulderCam: {
      args.pointerLock && cameraPointerLock(true);
      cameraFollow.offset.set(cameraFollow.shoulderSide ? -0.25 : 0.25, 1, 0);
      setVisible(actor, true);
    } break;

    default: case CameraModes.ThirdPerson: {
      args.pointerLock && cameraPointerLock(false);
      cameraFollow.offset.set(cameraFollow.shoulderSide ? -0.25 : 0.25, 1, 0);
      setVisible(actor, true);
    } break;

    case CameraModes.TopDown: {
      args.pointerLock && cameraPointerLock(false);
      cameraFollow.offset.set(0, 1, 0);
      setVisible(actor, true);
    } break;
  }
};