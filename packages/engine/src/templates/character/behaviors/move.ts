import { Input } from "../../../input/components/Input";
import { CharacterComponent } from "../components/CharacterComponent";
import { TransformComponent } from "../../../transform/components/TransformComponent";
import { NumericalType } from "@xr3ngine/engine/src/common/types/NumericalTypes";
import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { InputAlias } from "../../../input/types/InputAlias";
import { InputType } from "../../../input/enums/InputType";
import { getComponent, getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Vector3 } from "three";

let input: Input;
let actor: CharacterComponent;
let transform: TransformComponent;
let inputValue: NumericalType; // Could be a (small) source of garbage
const outputSpeed: Vector3 = new Vector3();

export const move: Behavior = (
  entity: Entity,
  args: { input: InputAlias; inputType: InputType; value: [number,number] },
  time: any
): void => {

  console.log(args);
  actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  transform = getMutableComponent<TransformComponent>(entity, TransformComponent);

  // Whatever the current movement group state is needs to have it's onChanged evaluator called
  const input: Input =  getMutableComponent<Input>(entity, Input as any);

  console.log(input.data.values());
  // Check current inputs

  const inputType = args.inputType;
  outputSpeed.copy( actor.acceleration ).multiplyScalar(time.delta);

  if (inputType === InputType.TWODIM) {
    inputValue = new Vector3(args.value[0], 0, args.value[1]);
  } else if (inputType === InputType.THREEDIM) {
    inputValue = new Vector3().fromArray(args.value);
  } else {
    console.error('Movement is only available for 2D and 3D inputs');
    return;
  }

  transform.velocity.add( inputValue.multiply(outputSpeed) );
};

export const moveByInputAxis: Behavior = (
  entity: Entity,
  args: { input: InputAlias; inputType: InputType },
  time: any
): void => {
  actor = getMutableComponent<CharacterComponent>(entity, CharacterComponent as any);
  input =  getComponent<Input>(entity, Input as any);

  const data = input.data.get(args.input);

  if (data.type === InputType.TWODIM) {
    actor.localMovementDirection.z = data.value[0];
    actor.localMovementDirection.x = data.value[1];
  } else if (data.type === InputType.THREEDIM) {
    // TODO: check if this mapping correct
    actor.localMovementDirection.z = data.value[2];
    actor.localMovementDirection.x = data.value[0];
  }
};
