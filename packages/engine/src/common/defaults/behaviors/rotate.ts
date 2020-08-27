import { quat, vec3 } from 'gl-matrix';
import { Entity } from '../../../ecs/classes/Entity';
import { Input } from '../../../input/components/Input';
import { InputType } from '../../../input/enums/InputType';
import { InputAlias } from '../../../input/types/InputAlias';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { Behavior } from '../../interfaces/Behavior';
import { NumericalType, Vector2, Vector3, Vector4 } from '../../types/NumericalTypes';
import { Actor } from '../components/Actor';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';

let actor: Actor;
let transform: TransformComponent;
let inputValue: Vector2 | Vector3;
let startValue: Vector2;
const q: Vector4 = [0, 0, 0, 0];
let inputComponent: Input;
let mouseDownPosition;
let originalRotation;
let valueX = 0, valueY = 0
const maxAngleX = 35.0472
const maxAngleY = 35.0472

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

  if (args.inputType === InputType.TWOD) {
    if (inputComponent.data.has(args.input)) {
      inputValue = inputComponent.data.get(args.input).value as Vector2;
      startValue = mouseDownPosition.value as Vector2;

      valueX += inputValue[0] - startValue[0]
      valueY += inputValue[1] - startValue[1]

      valueY > (maxAngleY / Math.PI) ? valueY = (maxAngleY / Math.PI):'';
      valueY < -(maxAngleY / Math.PI) ? valueY = -(maxAngleY / Math.PI):'';


      quat.fromEuler(
        q,
        -Math.min(Math.max(valueY* Math.PI, -maxAngleY), maxAngleY),
        valueX * Math.PI,
        0
      );

    }
  } else if (args.inputType === InputType.THREED) {
    inputValue = inputComponent.data.get(args.input).value as Vector3;

    quat.fromEuler(
      q,
      inputValue[0] * actor.rotationSpeedY * delta,
      inputValue[1] * actor.rotationSpeedX * delta,
      inputValue[2] * actor.rotationSpeedZ * delta
    );

  } else {
    console.error('Rotation is only available for 2D and 3D inputs');
  }

  transform.rotation = [q[0], q[1], q[2], q[3]];
};
