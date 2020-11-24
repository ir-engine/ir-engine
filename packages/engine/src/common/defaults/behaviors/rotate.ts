import { Entity } from '../../../ecs/classes/Entity';
import { Input } from '../../../input/components/Input';
import { InputType } from '../../../input/enums/InputType';
import { InputAlias } from '../../../input/types/InputAlias';
import { TransformComponent } from '../../../transform/components/TransformComponent';
import { Behavior } from '../../interfaces/Behavior';
import { NumericalType, Vector2Type, Vector3Type } from '../../types/NumericalTypes';
import { CharacterComponent } from '../../../templates/character/components/CharacterComponent';
import { getComponent, getMutableComponent } from '../../../ecs/functions/EntityFunctions';
import { Quaternion, Euler, Vector3 } from 'three';

let actor: CharacterComponent;
let transform: TransformComponent;
let inputValue: Vector2Type | Vector3Type;
let startValue: Vector2Type;
const q: Quaternion = new Quaternion();
let inputComponent: Input;
let mouseDownPosition;
let originalRotation;
const valueX = 0, valueY = 0;



export const rotateAround: Behavior = (
  entity: Entity,
  args: { input: InputAlias; inputType: InputType; value: NumericalType },
  delta: number
): void => {
/*
  inputComponent = getComponent(entity, Input);
  actor = getComponent(entity, CharacterComponent) as CharacterComponent;
  transform = getMutableComponent(entity, TransformComponent);

  mouseDownPosition = inputComponent.data.get(inputComponent.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition]);
  originalRotation = inputComponent.data.get(
    inputComponent.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation]
  );

  if (mouseDownPosition == undefined || originalRotation == undefined) return;

  if (!inputComponent.data.has(args.input)) {
    inputComponent.data.set(args.input, { type: args.inputType, value: new Vector3() });
  }

  if (args.inputType === InputType.TWODIM) {
    if (inputComponent.data.has(args.input)) {

      inputValue = inputComponent.data.get(args.input).value as Vector2Type;
      startValue = mouseDownPosition.value as Vector2Type;
    }

  } else if (args.inputType === InputType.THREED) {
    inputValue = inputComponent.data.get(args.input).value as Vector3Type;

    const euler = new Euler(
      inputValue[0] * actor.rotationSpeed * delta,
      inputValue[1] * actor.rotationSpeed * delta,
      inputValue[2] * actor.rotationSpeed * delta
    )
    
      q.setFromEuler(
        euler
    );

  } else {
    console.error('Rotation is only available for 2D and 3D inputs');
  }
*/
//  transform.rotation = [q[0], q[1], q[2], q[3]];
};
