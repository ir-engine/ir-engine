import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Input } from '@xr3ngine/engine/src/input/components/Input';
import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { InputAlias } from "../../input/types/InputAlias";
import { InputType } from "../../input/enums/InputType";
import { CameraModes } from '../types/CameraModes';
import { switchCameraMode } from './switchCameraMode';

/**
 * Change camera distance.
 * @param entity Entity holding camera and input component.
 */
export const changeCameraDistanceByDelta: Behavior = (entity: Entity, { input:inputAxes, inputType }: { input: InputAlias; inputType: InputType }): void => {
  const inputComponent = getComponent(entity, Input) as Input;

  if (!inputComponent.data.has(inputAxes)) {
    return;
  }

  const inputPrevValue = inputComponent.prevData.get(inputAxes)?.value as number ?? 0;
  const inputValue = inputComponent.data.get(inputAxes).value as number;

  const delta = inputValue - inputPrevValue;

  const cameraFollow = getMutableComponent<FollowCameraComponent>(entity, FollowCameraComponent);
  if(cameraFollow === undefined) return //console.warn("cameraFollow is undefined");

  switch(cameraFollow.mode) {
    case CameraModes.FirstPerson: 
      if(delta > 0) { 
        switchCameraMode(entity, { mode: CameraModes.ShoulderCam })
      }
    break;
    case CameraModes.ShoulderCam: 
      if(delta > 0) {
        switchCameraMode(entity, { mode: CameraModes.ThirdPerson })
        cameraFollow.distance = cameraFollow.minDistance + 1
      }
      if(delta < 0) {
        switchCameraMode(entity, { mode: CameraModes.FirstPerson })
      }
    break;
    default: case CameraModes.ThirdPerson:  
      const newDistance = cameraFollow.distance + delta;
      cameraFollow.distance = Math.max(cameraFollow.minDistance, Math.min( cameraFollow.maxDistance, newDistance));

      if(cameraFollow.distance >= cameraFollow.maxDistance) {
        if(delta > 0) {
          switchCameraMode(entity, { mode: CameraModes.TopDown })
        }
      } else if(cameraFollow.distance <= cameraFollow.minDistance) {
        if(delta < 0) {
          switchCameraMode(entity, { mode: CameraModes.ShoulderCam })
        }
      }
  
    break;
    case CameraModes.TopDown: 
      if(delta < 0) {
        switchCameraMode(entity, { mode: CameraModes.ThirdPerson })
      } 
    break;
  }
};