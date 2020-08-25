import * as THREE from 'three'
import { quat, vec3, mat3, mat4 } from 'gl-matrix';
import { Entity } from '../../../ecs/classes/Entity';
import { Input } from '../../../input/components/Input';
import { InputType } from '../../../input/enums/InputType';
import { InputAlias } from '../../../input/types/InputAlias';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { Behavior } from '../../interfaces/Behavior';
import { NumericalType, Vector2, Vector3, Vector4, Matrix3, Matrix4 } from '../../types/NumericalTypes';
import { Actor } from '../components/Actor';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';

let actor: Actor;
let transform: TransformComponent;
let inputValue: Vector2 | Vector3;
let startValue: Vector2;
const qx: Vector4 = [0, 0, 0, 0];
const qy: Vector4 = [0, 0, 0, 0];
const qOut: Vector4 = [0, 0, 0, 0];
const oldQ: Vector4 = [0, 0, 0, 0];
const matrixX: Matrix4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const matrixY: Matrix4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const matrixOld: Matrix4 = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
const matrixOut: Matrix3 = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let inputComponent: Input;
let mouseDownPosition;
let originalRotation;
let rrr

export const rotateAround: Behavior = (
  entity: Entity,
  args: { input: InputAlias, inputType: InputType, value: NumericalType },
  delta: number
): void => {

  inputComponent = getComponent(entity, Input);
  actor = getComponent(entity, Actor) as Actor;
  transform = getMutableComponent(entity, TransformComponent);

  mouseDownPosition = inputComponent.data.get(inputComponent.schema.mouseInputMap.axes.mouseClickDownPosition);
  originalRotation = inputComponent.data.get(
    inputComponent.schema.mouseInputMap.axes.mouseClickDownTransformRotation
  );

  if (mouseDownPosition == undefined || originalRotation == undefined) return;

  if (!inputComponent.data.has(args.input)) {
    inputComponent.data.set(args.input, { type: args.inputType, value: vec3.create() });
  }

  quat.set(
    oldQ,
    originalRotation.value[0],
    originalRotation.value[1],
    originalRotation.value[2],
    originalRotation.value[3]
  );

  console.log('MEGA TEST ----------------------');
  console.log(originalRotation.value[0],
              originalRotation.value[1],
              originalRotation.value[2],
              originalRotation.value[3]);
  console.log(' --------------------------------');

  if (args.inputType === InputType.TWOD) {
    if (inputComponent.data.has(args.input)) {
      inputValue = inputComponent.data.get(args.input).value as Vector2;
      startValue = mouseDownPosition.value as Vector2;

      let valueX = (inputValue[0] - startValue[0])* Math.PI
      let valueY = -(inputValue[1] - startValue[1])* Math.PI


/*
      mat4.fromXRotation(matrixX, valueY)
      mat4.fromYRotation(matrixY, valueX)

      console.log('MATRIX ---------------------->');
      mat4.multiply(matrixOld, matrixX, matrixY)
      mat3.fromMat4(matrixOut, matrixOld)
*/
/*
      console.log('x: '+valueX+' '+'y: '+valueY);
      console.log(startValue[0],startValue[1]);
      console.log(inputValue[0],inputValue[1]);
*/
      //console.log(valueX * actor.rotationSpeedY * delta);


    //  actor.rotationSpeedY = 10
    //  actor.rotationSpeedX = 10
  //    quat.rotateY(qOut, qOut, valueX * Math.PI);
    //  quat.rotateX(qOut, qOut, valueY * Math.PI);
/*
      quat.fromEuler(
        q,
        valueY * 10, //* delta,
        valueX * 10, //* delta,
        0
      );
*/

//var translation = new THREE.Matrix4().makeTranslation(boat.position.x, boat.position.y, boat.position.z);
//var rotationZ = new THREE.Matrix4().makeRotationZ(-THREE.Math.degToRad(boat.cap));


var roationOld = new THREE.Matrix4().makeRotationFromQuaternion(new THREE.Quaternion().set(originalRotation.value[0],
            originalRotation.value[1],
            originalRotation.value[2],
            originalRotation.value[3]))

var rotationX = new THREE.Matrix4().makeRotationX(valueY);
var rotationY = new THREE.Matrix4().makeRotationY(valueX);
var roationXY = rotationY.multiply(rotationX);
var roationXYOld = roationXY.multiply(roationOld);
rrr =  new THREE.Quaternion().setFromRotationMatrix(roationXYOld)

console.log('RRRRRR');
console.log(rrr);

//new THREE.Matrix4().applyMatrix(roationXY );
//  new THREE.Matrix4().multiplyMatrices()

/*
      quat.setAxisAngle(qx, vec3.fromValues(1, 0, 0), valueY)
      quat.setAxisAngle(qy, vec3.fromValues(0, 1, 0), valueX)

      quat.multiply(qOut, qx, qy)
*/

  //    console.log('oldQ');


    }
  } else if (args.inputType === InputType.THREED) {
    inputValue = inputComponent.data.get(args.input).value as Vector3;
    console.log(inputValue);
/*
    quat.fromEuler(
      q,
      inputValue[0] * actor.rotationSpeedY * delta,
      inputValue[1] * actor.rotationSpeedX * delta,
      inputValue[2] * actor.rotationSpeedZ * delta
    );
*/
  } else {
    console.error('Rotation is only available for 2D and 3D inputs');
  }
  //console.log('q[0]: '+q[0]+' '+'q[1]: '+q[1]+'q[2]: '+q[2]+' '+'q[3]: '+q[3]);

  transform.rotation = [rrr._x, rrr._y, rrr._z, rrr._w];
};
