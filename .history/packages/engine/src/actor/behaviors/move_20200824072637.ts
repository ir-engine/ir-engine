import { Input } from "../../input/components/Input";
import { Actor } from "../components/Actor";
import { TransformComponent } from "../../transform/components/TransformComponent";
import { Vector2, Vector3, NumericalType } from "../../common/types/NumericalTypes";
import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { InputAlias } from "../../input/types/InputAlias";
import { InputType } from "../../input/enums/InputType";
import { getComponent, getMutableComponent, hasComponent } from "../../ecs/functions/EntityFunctions";
import { Crouching } from "../components/Crouching";
import { Sprinting } from "../components/Sprinting";

let input: Input;
let actor: Actor;
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
  actor = getMutableComponent<Actor>(entity, Actor);
  transform = getMutableComponent<TransformComponent>(entity, TransformComponent);


  const movementModifer = hasComponent(entity, Crouching) ? 0.5 : hasComponent(entity, Sprinting) ? 1.5 : 1.0;
  const inputType = args.inputType;
  outputSpeed = actor.accelerationSpeed * (time.delta) * movementModifer;
  if (inputType === InputType.TWOD) {
    inputValue = args.value as Vector2;
    transform.velocity[0] = transform.velocity[0] + inputValue[0] * outputSpeed;
    transform.velocity[2] = transform.velocity[2] + inputValue[1] * outputSpeed;
  } else if (inputType === InputType.THREED) {
    inputValue = args.value as Vector3;
    transform.velocity[0] = transform.velocity[0] + inputValue[0] * outputSpeed;
    transform.velocity[1] = transform.velocity[1] + inputValue[1] * outputSpeed;
    transform.velocity[2] = transform.velocity[2] + inputValue[2] * outputSpeed;
  } else {
    console.error('Movement is only available for 2D and 3D inputs');
  }
};
