import { Behavior } from "@xr3ngine/engine/src/common/interfaces/Behavior";
import { Entity } from "../../../ecs/classes/Entity";
import { InputAlias } from "../../../input/types/InputAlias";
import { InputType } from "../../../input/enums/InputType";
import { getMutableComponent } from "../../../ecs/functions/EntityFunctions";
import { Input } from "../../../input/components/Input";
import { LifecycleValue } from "@xr3ngine/engine/src/common/enums/LifecycleValue";

/**
 *
 * @param entity
 * @param args
 * @param time
 */
export const lookByInputAxis: Behavior = (
  entity: Entity,
  args: {
    input: InputAlias; // axis input to take values from
    output: InputAlias; // look input to set values to
    inputType: InputType; // type of value
    multiplier: number; //
  },
  time: any
): void => {
  const input = getMutableComponent<Input>(entity, Input);
  const data = input.data.get(args.input);
  const multiplier = args.multiplier ?? 1;
  // adding very small noise to trigger same value to be "changed"
  // till axis values is not zero, look input should be treated as changed
  const noiseX = (Math.random() > 0.5 ? 1 : -1 ) * 0.0000001;
  const noiseY = (Math.random() > 0.5 ? 1 : -1 ) * 0.0000001;

  if (data.type === InputType.TWODIM) {
    const isEmpty = (Math.abs(data.value[0]) === 0 && Math.abs(data.value[1]) === 0);
    // axis is set, transfer it into output and trigger changed
    if (!isEmpty) {
      input.data.set(args.output, {
        type: data.type,
        value: [
          data.value[0] * multiplier + noiseX,
          data.value[1] * multiplier + noiseY
        ],
        lifecycleState: LifecycleValue.CHANGED
      });
    }
  } else if (data.type === InputType.THREEDIM) {
    // TODO: check if this mapping correct
    const isEmpty = (Math.abs(data.value[0]) === 0 && Math.abs(data.value[2]) === 0);
    if (!isEmpty) {
      input.data.set(args.output, {
        type: data.type,
        value: [
          data.value[0] * multiplier + noiseX,
          data.value[2] * multiplier + noiseY
        ],
        lifecycleState: LifecycleValue.CHANGED
      });
    }
  }
};