import * as THREE from 'three';
import { Entity } from '../../ecs/classes/Entity';
import { Behavior } from '../../common/interfaces/Behavior';
import { Input } from '../../input/components/Input';
import { InputType } from '../../input/enums/InputType';
import { TransformComponent } from '../components/TransformComponent';
import { CameraComponent } from '../../camera/components/CameraComponent';
import { getComponent, getMutableComponent } from '../../ecs/functions/EntityFunctions';
import { CharacterComponent } from '../../templates/character/components/CharacterComponent';
import { Quaternion } from 'cannon-es';
import { Vector3 } from 'three';

let follower, target;
let inputComponent;
let mouseDownPosition;
let originalRotation;
let actor, camera;
let inputValue, startValue;
const q = new Quaternion();
const direction = new Vector3();

const maxAngleX = 35.0472;
const maxAngleY = 35.0472;

const sensitivity = [1,1];
let mx, qw;
const movementSpeed = 0.06;
const radius = 3;
let theta = 0;
let phi = 0;

let valueX = 0, valueY = 0;

export const followTarget: Behavior = (entityIn: Entity, args: any, delta: any, entityOut: Entity): void => {
  follower = getMutableComponent<TransformComponent>(entityIn, TransformComponent); // Camera
  target = getMutableComponent<TransformComponent>(entityOut, TransformComponent); // Player


  inputComponent = getComponent(entityOut, Input);
  actor = getComponent(entityOut, CharacterComponent) as CharacterComponent;
  camera = getMutableComponent<CameraComponent>(entityIn, CameraComponent);


  //console.log(inputComponent.schema.mouseInputMap.axes.[MouseInput.MouseClickDownPosition]);

  if (inputComponent) {
    mouseDownPosition = inputComponent.data.get(15);
    if (mouseDownPosition == undefined) return;
    if (!inputComponent.data.has(args.input)) {
      inputComponent.data.set(args.input, { type: InputType.TWODIM, value: new Vector3() });
    }
    inputValue = inputComponent.data.get(args.input).value; //as Vector2;
    startValue = mouseDownPosition.value; //as Vector2;
  } else {
    inputValue = [0, 0];
    startValue = [0, 0];
  }


/*
  originalRotation = inputComponent.data.get(
    inputComponent.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation]
  );
*/



//  if (inputComponent.data.has(args.input)) {
      if (camera.mode === "firstPerson") {
        if (inputComponent) {
          valueX += inputValue[0] - startValue[0];
          valueY += inputValue[1] - startValue[1];

          valueY > (maxAngleY / Math.PI) ? valueY = (maxAngleY / Math.PI):'';
          valueY < -(maxAngleY / Math.PI) ? valueY = -(maxAngleY / Math.PI):'';
           
          q.setFromEuler(-Math.min(Math.max(valueY* Math.PI, -maxAngleY), maxAngleY), valueX * Math.PI, 0);

          target.rotation = [q[0], q[1], q[2], q[3]];
          target.position[1] = 2;
        }
        follower.copy(target);
      }

      else if (camera.mode === "thirdPerson") {

        valueX = (inputValue[0] - startValue[0]);
        valueY = (inputValue[1] - startValue[1]);

        valueY > (maxAngleY / Math.PI) ? valueY = (maxAngleY / Math.PI):'';
        valueY < -(maxAngleY / Math.PI) ? valueY = -(maxAngleY / Math.PI):'';

        theta -= valueY * (1 / 2);
        theta %= 360;
        phi += valueX * (1 / 2);
        phi = Math.min(85, Math.max(-85, phi));

        follower.position[0] = target.position[0] + camera.distance * Math.cos(theta *  Math.PI / 180) *  Math.cos(phi * Math.PI / 180);
        follower.position[1] = target.position[1] + camera.distance * Math.sin(theta *  Math.PI / 180) *  Math.cos(phi * Math.PI / 180);
        follower.position[2] = target.position[2] + camera.distance * Math.sin(phi *  Math.PI / 180);

        direction.sub(target.position);
        direction.normalize();


        mx = new THREE.Matrix4().lookAt(new THREE.Vector3(direction[0],direction[1],direction[2]),new THREE.Vector3(0,0,0),new THREE.Vector3(0,1,0));
        qw = new THREE.Quaternion().setFromRotationMatrix(mx);

        follower.rotation = [qw.x, qw.y, qw.z, qw.w];
        target.rotation = [qw.x, qw.y, qw.z, qw.w];
      }
};
