import { Vector3, Matrix4, Euler } from 'three';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Input } from '@xr3ngine/engine/src/input/components/Input';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { FollowCameraComponent } from '@xr3ngine/engine/src/camera/components/FollowCameraComponent';

import { getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import {MouseInput} from "../../input/enums/MouseInput";
import { DefaultInput } from "../../templates/shared/DefaultInput";
import { LifecycleValue } from '../../common/enums/LifecycleValue';

let follower, target;
let inputComponent:Input;
let cameraFollow;
let mouseDownPosition
let originalRotation
let actor, camera
let inputValue, startValue
const euler = new Euler( 0, 0, 0, 'YXZ' );
let direction = new Vector3();
const up = new Vector3( 0, 1, 0)
const empty = new Vector3()
const PI_2 = Math.PI / 2;
const maxPolarAngle = 45
const minPolarAngle = 0

let mx = new Matrix4();
let theta = 0;
let phi = 0;



export const setCameraFollow: Behavior = (entityIn: Entity, args: any, delta: any, entityOut: Entity): void => {
  follower = getMutableComponent<TransformComponent>(entityIn, TransformComponent); // Camera
  target = getMutableComponent<TransformComponent>(entityOut, TransformComponent); // Player

  inputComponent = getComponent(entityOut, Input) as Input;
  cameraFollow = getComponent<FollowCameraComponent>(entityOut, FollowCameraComponent);

  camera = getMutableComponent<CameraComponent>(entityIn, CameraComponent);

  let inputAxes;
  if (inputComponent.data.has(DefaultInput.LOOKTURN_PLAYERONE)) {
    inputAxes = DefaultInput.LOOKTURN_PLAYERONE
  } else {
    if (document.pointerLockElement) {
      inputAxes = inputComponent.schema.mouseInputMap.axes[MouseInput.MouseMovement]
    } else {
      inputAxes = DefaultInput.LOOKTURN_PLAYERONE
    }
  }

  if (!inputComponent.data.has(inputAxes)) {
    inputValue = [0, 0]
  } else {
    const inputData = inputComponent.data.get(inputAxes)
    inputValue = inputData.value
    if (inputData.lifecycleState === LifecycleValue.ENDED) {
      // skip
      return
    }
    console.log('inputData.lifecycleState', inputData.lifecycleState.toString())
    if (inputData.lifecycleState !== LifecycleValue.CHANGED) {
      console.log('! LifecycleValue.CHANGED')
      debugger
    }
    const preInputData = inputComponent.prevData.get(inputAxes)

    if (inputData.lifecycleState === LifecycleValue.CHANGED) {
      console.log(inputValue, '->', preInputData?.value)
    }

    if (inputValue[0] === preInputData?.value[0] && inputValue[1] === preInputData?.value[1]) {
      debugger
    }



    // fix infinity rotation
    // Math.abs(inputValue[0] + inputValue[1]) == 1 ? inputValue = [0, 0] : '';
    // if (inputAxes === DefaultInput.MOUSE_MOVEMENT) {
    //   // TODO: is it ok to clear it?
    //   inputComponent.data.delete(inputAxes)
    // }
  }

  if (cameraFollow.mode === "firstPerson") {

      euler.setFromQuaternion( follower.rotation );

  		euler.y -= inputValue[0] * 0.01;
  		euler.x -= inputValue[1] * 0.01;

  		euler.x = Math.max( PI_2 - maxPolarAngle, Math.min( PI_2 - minPolarAngle, euler.x ) );

  		follower.rotation.setFromEuler( euler );

      follower.position.set(
        target.position.x,
        3,
        target.position.z
      )
    }
    else if (cameraFollow.mode === "thirdPerson") {

      theta -= inputValue[0] * (1 / 2);
      theta %= 360;
      phi += inputValue[1] * (1 / 2);
      phi = Math.min(85, Math.max(0, phi));

      follower.position.set(
        target.position.x + cameraFollow.distance * Math.sin(theta *  Math.PI / 180) *  Math.cos(phi * Math.PI / 180),
        target.position.y + cameraFollow.distance * Math.sin(phi *  Math.PI / 180),
        target.position.z + cameraFollow.distance * Math.cos(theta *  Math.PI / 180) *  Math.cos(phi * Math.PI / 180)
      )

      direction.copy(follower.position)
      direction = direction.sub(target.position).normalize()

      mx.lookAt(direction, empty, up);

      follower.rotation.setFromRotationMatrix(mx);
    }
};
