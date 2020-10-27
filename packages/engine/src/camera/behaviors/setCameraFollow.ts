import { Vector3, Matrix4, Euler } from 'three';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Input } from '@xr3ngine/engine/src/input/components/Input';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';
import { getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { LifecycleValue } from '../../common/enums/LifecycleValue';
import { NumericalType } from "../../common/types/NumericalTypes";
import { normalizeMouseCoordinates } from '../../common/functions/normalizeMouseCoordinates';

let follower, target;
let inputComponent: Input;
let cameraFollow;
let actor, camera
let inputValue, startValue
const euler = new Euler( 0, 0, 0, 'YXZ' );
let direction = new Vector3();
const up = new Vector3( 0, 1, 0);
const empty = new Vector3();
const PI_2 = Math.PI / 2;

const mx = new Matrix4();
let theta = 0;
let phi = 0;

export const setCameraFollow: Behavior = (entityIn: Entity, args: any, delta: any, entityOut: Entity): void => {
  follower = getMutableComponent<TransformComponent>(entityIn, TransformComponent); // Camera
  target = getMutableComponent<TransformComponent>(entityOut, TransformComponent); // Player

  inputComponent = getComponent(entityOut, Input) as Input;
  cameraFollow = getComponent<FollowCameraComponent>(entityOut, FollowCameraComponent);

  camera = getMutableComponent<CameraComponent>(entityIn, CameraComponent);

  let inputAxes;
  if (document.pointerLockElement) {
    inputAxes = DefaultInput.MOUSE_MOVEMENT;
  } else {
    inputAxes = DefaultInput.LOOKTURN_PLAYERONE;
  }
    
  inputValue = getInputData(inputComponent, inputAxes);

  if (cameraFollow.mode === "firstPerson") {

      euler.setFromQuaternion( follower.rotation );

  		euler.y -= inputValue[0] * 0.01;
      euler.x -= inputValue[1] * 0.01;
      
      // euler.y -= normalizedPosition.y;
  		// euler.x -= normalizedPosition.x;
      
      euler.x = Math.max( -PI_2, Math.min( PI_2, euler.x ) );    

  		follower.rotation.setFromEuler( euler );

      follower.position.set(
        target.position.x,
        target.position.y + 1,
        target.position.z
      );
    }
    else if (cameraFollow.mode === "thirdPerson") {

      theta += inputValue[0] * 120;
      theta %= 360;
      phi += inputValue[1] * 120;
      phi = Math.min(85, Math.max(0, phi));

      follower.position.set(
        target.position.x + cameraFollow.distance * Math.sin(theta *  Math.PI / 180) *  Math.cos(phi * Math.PI / 180),
        target.position.y + cameraFollow.distance * Math.sin(phi *  Math.PI / 180),
        target.position.z + cameraFollow.distance * Math.cos(theta *  Math.PI / 180) *  Math.cos(phi * Math.PI / 180)
      );
      
      direction.copy(follower.position);
      direction = direction.sub(target.position).normalize();

      mx.lookAt(direction, empty, up);

      follower.rotation.setFromRotationMatrix(mx);
    }
};

function getInputData(inputComponent: Input, inputAxes: number): NumericalType {
  const emptyInputValue = [0, 0] as NumericalType

  if (inputComponent.data.has(inputAxes)) {
    const inputData = inputComponent.data.get(inputAxes)
    const inputValue = inputData.value
    if (inputData.lifecycleState === LifecycleValue.ENDED || inputData.lifecycleState === LifecycleValue.UNCHANGED) {
      // skip
      return emptyInputValue
    }

    if (inputData.lifecycleState !== LifecycleValue.CHANGED) {
      // console.log('! LifecycleValue.CHANGED', LifecycleValue[inputData.lifecycleState])
      return emptyInputValue
    }

    const preInputData = inputComponent.prevData.get(inputAxes)
    if (inputValue[0] === preInputData?.value[0] && inputValue[1] === preInputData?.value[1]) {
      // debugger
      // return
    }
    return inputValue
  }

  return emptyInputValue
}
