import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { Material } from 'three';
import { SkinnedMesh } from 'three/src/objects/SkinnedMesh';
import { Entity } from '../../ecs/classes/Entity';
import { getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { CameraModes } from "../types/CameraModes";
import { cameraPointerLock } from './cameraPointerLock';

const setVisible = (character: CharacterComponent, visible: boolean): void => {
  if(character.visible !== visible) {
    character.visible = visible;
    character.tiltContainer.traverse((obj) => {
      const mat = (obj as SkinnedMesh).material;
      if(mat) {
        (mat as Material).visible = visible;
      }
    });
  }
};

export const switchCameraMode = (entity: Entity, args: any = { pointerLock: false, mode: CameraModes.ThirdPerson }): void => {
  const actor: CharacterComponent = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);

  const cameraFollow = getMutableComponent(entity, FollowCameraComponent);
  cameraFollow.mode = args.mode

  switch(args.mode) {
    case CameraModes.FirstPerson: {
      args.pointerLock && cameraPointerLock(true);
      cameraFollow.offset.set(0, 1, 0);
      cameraFollow.phi = 0;
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