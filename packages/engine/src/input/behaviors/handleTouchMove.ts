import { Behavior } from '../../common/interfaces/Behavior';
import { Entity } from '../../ecs/classes/Entity';
import { TouchInputs } from "../enums/TouchInputs";
import { InputType } from "../enums/InputType";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../components/Input";
import { DefaultInput } from '../../templates/shared/DefaultInput';

/**
 * Touch move
 * 
 * @param {Entity} entity The entity
 * @param args is argument object
 */
export const handleTouchMove: Behavior = (entity: Entity, args: { event: TouchEvent }): void => {
  const input = getComponent(entity, Input);

  let s = 'Touch move.';
  // A list of contact points on a touch surface.
  if (args.event.targetTouches.length) {
    s +=
      ' x: ' +
      Math.trunc(args.event.targetTouches[0].clientX) +
      ', y: ' +
      Math.trunc(args.event.targetTouches[0].clientY);

    if (args.event.targetTouches.length == 2) {
      if ((args.event as any).scale) {
        debugger;
      }


      const scaleMappedInputKey = input.schema.touchInputMap?.axes[TouchInputs.Scale];
      if (scaleMappedInputKey) {

        if ((args.event as any).scale) {
          input.data.set(scaleMappedInputKey, {
            type: InputType.ONEDIM,
            value: (args.event as any).scale,
            lifecycleState: LifecycleValue.CHANGED
          });
        }
      }
    }

  }
  // console.log(s);
};
