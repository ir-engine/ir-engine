import { CharacterComponent } from "../components/CharacterComponent";
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { Vector2, Vector3, Vector4 } from "three";
import { Input } from "../../../input/components/Input";
import { Behavior } from "../../../common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { InputAlias } from "../../../input/types/InputAlias";
import { InputType } from "../../../input/enums/InputType";
import { NumericalType } from "../../../common/types/NumericalTypes";
import { getComponent, getMutableComponent } from "../../../ecs/functions/EntityFunctions";

let actor: CharacterComponent;
let transform: TransformComponent;
let inputValue: Vector2 | Vector3;
let startValue: Vector2;
let inputComponent: Input;
let mouseDownPosition;
let originalRotation;
export const rotateAround: Behavior = (
  entity: Entity,
  args: { input: InputAlias, inputType: InputType, value: NumericalType },
  delta: number
): void => {
  inputComponent = getComponent(entity, Input);
  actor = getComponent(entity, CharacterComponent as any) as CharacterComponent;
  transform = getMutableComponent<TransformComponent>(entity, TransformComponent);

  mouseDownPosition = inputComponent.data.get(inputComponent.schema.mouseInputMap.axes.mouseClickDownPosition);
  originalRotation = inputComponent.data.get(
    inputComponent.schema.mouseInputMap.axes.mouseClickDownTransformRotation
  );

  if (mouseDownPosition == undefined || originalRotation == undefined) return;
    console.log("Rotation goes here")
  // if (!inputComponent.data.has(args.input)) {
  //   inputComponent.data.set(args.input, { type: args.inputType, value: vec3.create() });
  // }

  // quat.set(
  //   qOut,
  //   originalRotation.value[0],
  //   originalRotation.value[1],
  //   originalRotation.value[2],
  //   originalRotation.value[3]
  // );
  // if (args.inputType === InputType.TWOD) {
  //   if (inputComponent.data.has(args.input)) {
  //     inputValue = inputComponent.data.get(args.input).value as Vector2;
  //     startValue = mouseDownPosition.value as Vector2;
  //     quat.rotateY(qOut, qOut, (inputValue[0] - startValue[0]) * Math.PI);
  //     quat.rotateX(qOut, qOut, -(inputValue[1] - startValue[1]) * Math.PI);
  //   }
  // } else if (args.inputType === InputType.THREED) {
  //   inputValue = inputComponent.data.get(args.input).value as Vector3;
  //   quat.fromEuler(
  //     q,
  //     inputValue[0] * actor.rotationSpeedY * delta,
  //     inputValue[1] * actor.rotationSpeedX * delta,
  //     inputValue[2] * actor.rotationSpeedZ * delta
  //   );
  // } else {
  //   console.error('Rotation is only available for 2D and 3D inputs');
  // }

  // transform.rotation = [qOut[0], qOut[1], qOut[2], qOut[3]];
};
