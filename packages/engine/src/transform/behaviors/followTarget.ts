import { quat, vec3, mat4 } from 'gl-matrix';
import * as THREE from 'three';
import { Entity } from '../../ecs/classes/Entity';
import { Behavior } from '../../common/interfaces/Behavior';
import { Input } from '../../input/components/Input';
import { InputType } from '../../input/enums/InputType';
import { InputAlias } from '../../input/types/InputAlias';
import { TransformComponent } from '../components/TransformComponent';
import { NumericalType, Vector2, Vector3, Vector4 } from '../../common/types/NumericalTypes';
import { Actor } from '../../common/defaults/components/Actor';
import { CameraComponent } from '../../camera/components/CameraComponent';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';

let follower, target;
let inputComponent
let mouseDownPosition
let originalRotation
let actor, camera
let inputValue, startValue
const q: Vector4 = [0, 0, 0, 0];
const direction: Vector3 = [0, 0, 0];

let sensitivity = [1,1]
let mx, qw
let movementSpeed = 0.06;
let radius = 3;
let theta = 0;
let phi = 0;

let valueX = 0, valueY = 0

export const followTarget: Behavior = (entityIn: Entity, args: any, delta: any, entityOut: Entity): void => {
  follower = getMutableComponent<TransformComponent>(entityIn, TransformComponent); // Camera
  target = getMutableComponent<TransformComponent>(entityOut, TransformComponent); // Player


  inputComponent = getComponent(entityOut, Input);
  actor = getComponent(entityOut, Actor) as Actor;
  camera = getMutableComponent<CameraComponent>(entityIn, CameraComponent);


  //console.log(inputComponent.schema.mouseInputMap.axes.mouseClickDownPosition);

  mouseDownPosition = inputComponent.data.get(15);


/*
  originalRotation = inputComponent.data.get(
    inputComponent.schema.mouseInputMap.axes.mouseClickDownTransformRotation
  );
*/
  if (mouseDownPosition == undefined) return;

  if (!inputComponent.data.has(args.input)) {
    inputComponent.data.set(args.input, { type: InputType.TWOD, value: vec3.create() });
  }


  inputValue = inputComponent.data.get(args.input).value //as Vector2;
  startValue = mouseDownPosition.value //as Vector2;

  valueX = (inputValue[0] - startValue[0])
  valueY = (inputValue[1] - startValue[1])




  if (true) {
    if (inputComponent.data.has(args.input)) {

      if (false) {

        target.position[1] = 2
        follower.copy(target);

      } else {


        theta -= valueY * (1 / 2);
        theta %= 360;
        phi += valueX * (1 / 2);
        phi = Math.min(85, Math.max(-85, phi));

        follower.position[0] = target.position[0] + 5 * Math.cos(theta *  Math.PI / 180) *  Math.cos(phi * Math.PI / 180);
        follower.position[1] = target.position[1] + 5 * Math.sin(theta *  Math.PI / 180) *  Math.cos(phi * Math.PI / 180);
        follower.position[2] = target.position[2] + 5 * Math.sin(phi *  Math.PI / 180);

        vec3.subtract(direction, follower.position, target.position)
        vec3.normalize(direction, direction)


        mx = new THREE.Matrix4().lookAt(new THREE.Vector3(direction[0],direction[1],direction[2]),new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0));
        qw = new THREE.Quaternion().setFromRotationMatrix(mx);

        follower.rotation = [qw.x, qw.y, qw.z, qw.w];
        target.rotation = [qw.x, qw.y, qw.z, qw.w];
      }

    }
  }


};
