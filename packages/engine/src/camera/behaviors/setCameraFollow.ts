//import { Quaternion } from 'cannon-es';
import { Vector3, Matrix4, Quaternion, Euler } from 'three';
import { Entity } from '@xr3ngine/engine/src/ecs/classes/Entity';
import { Behavior } from '@xr3ngine/engine/src/common/interfaces/Behavior';
import { Input } from '@xr3ngine/engine/src/input/components/Input';
import { InputType } from '@xr3ngine/engine/src/input/enums/InputType';
import { InputAlias } from '@xr3ngine/engine/src/input/types/InputAlias';
import { TransformComponent } from '@xr3ngine/engine/src/transform/components/TransformComponent';
import { CameraComponent } from '@xr3ngine/engine/src/camera/components/CameraComponent';
import { getComponent, getMutableComponent } from '@xr3ngine/engine/src/ecs/functions/EntityFunctions';
import { CharacterComponent } from '@xr3ngine/engine/src/templates/character/components/CharacterComponent';


let follower, target;
let inputComponent
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

  inputComponent = getComponent(entityOut, Input);
  camera = getMutableComponent<CameraComponent>(entityIn, CameraComponent);

  if (inputComponent.data.get(inputComponent.schema.mouseInputMap.axes.mouseMovement) == undefined) {
    inputValue = [0, 0]
  } else {
    inputValue = inputComponent.data.get(inputComponent.schema.mouseInputMap.axes.mouseMovement).value
    // fix infinity rotation
    Math.abs(inputValue[0] + inputValue[1]) == 1 ? inputValue = [0, 0] : '';
  }

  if (camera.mode === "firstPerson") {

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
    else if (camera.mode === "thirdPerson") {

      theta -= inputValue[0] * (1 / 2);
      theta %= 360;
      phi += inputValue[1] * (1 / 2);
      phi = Math.min(85, Math.max(0, phi));

      follower.position.set(
        target.position.x + camera.distance * Math.sin(theta *  Math.PI / 180) *  Math.cos(phi * Math.PI / 180),
        target.position.y + camera.distance * Math.sin(phi *  Math.PI / 180),
        target.position.z + camera.distance * Math.cos(theta *  Math.PI / 180) *  Math.cos(phi * Math.PI / 180)
      )

      direction.copy(follower.position)
      direction = direction.sub(target.position).normalize()

      mx.lookAt(direction, empty, up);

      follower.rotation.setFromRotationMatrix(mx);
    }
};
