import { Input } from "../../../input/components/Input";
import { CharacterComponent } from "../../../character/components/CharacterComponent";
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { NumericalType } from "../../../common/types/NumericalTypes";
import { Behavior } from "../../../common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { InputAlias } from "../../../input/types/InputAlias";
import { InputType } from "../../../input/enums/InputType";
import { getComponent, getMutableComponent, hasComponent } from "../../../ecs/functions/EntityFunctions";
import { Sprinting } from "../../../character/components/Sprinting";
import { Vector2, Vector3 } from "three";

let input: Input;
let actor: CharacterComponent;
let transform: TransformComponent;
let inputValue: NumericalType; // Could be a (small) source of garbage
let outputSpeed: number;

export const move: Behavior = (
  entity: Entity,
  args: { input: InputAlias, inputType: InputType, value: NumericalType },
  time: any
): void => {

  console.log(args)
  input = getComponent(entity, Input);
  actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  transform = getMutableComponent<TransformComponent>(entity, TransformComponent);

  // const movementModifer = hasComponent(entity, Crouching) ? 0.5 : hasComponent(entity, Sprinting) ? 1.5 : 1.0;
  // const inputType = args.inputType;
  // outputSpeed = actor.accelerationSpeed * (time.delta) * movementModifer;
  // if (inputType === InputType.TWOD) {
  //   inputValue = args.value as Vector2;
  //   transform.velocity = transform.velocity // + inputValue[0] * outputSpeed;
  // } else if (inputType === InputType.THREED) {
  //   inputValue = args.value as Vector3;
  //   transform.velocity = transform.velocity // transform.velocity+ inputValue[0] * outputSpeed;
  // } else {
  //   console.error('Movement is only available for 2D and 3D inputs');
  // }
};
