import { Behavior } from "../../common/interfaces/Behavior";
import { Entity } from "../../ecs/classes/Entity";
import { InputType } from "../enums/InputType";
import { Input } from "../components/Input";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { MouseInput } from "../enums/MouseInput";
import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { BinaryValue } from "../../common/enums/BinaryValue";

/**
 * System behavior called whenever the mouse pressed
 *
 * @param {Entity} entity The entity
 * @param args is argument object. Events that occur due to the user interacting with a pointing device (such as a mouse).
 */

export const handleMouseLeave: Behavior = (entity: Entity, args: { event: MouseEvent }): void => {
    const input = getComponent(entity, Input);

    Object.keys(input.schema.mouseInputMap.buttons).forEach(button => {
        if (!input.data.has(button)) {
            return;
        }

        input.data.set(button, {
            type: InputType.BUTTON,
            value: BinaryValue.OFF,
            lifecycleState: LifecycleValue.ENDED
        });
    });

    if (input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition]) {
        const axis = input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition];
        if (input.data.has(axis)) {
            const value = input.data.get(axis).value;

            if (value[0] !== 0 || value[1] !== 0) {
                input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition], {
                    type: InputType.TWODIM,
                    value: [0, 0],
                    lifecycleState: LifecycleValue.ENDED
                });
            }
        }
    }

    if (input.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation]) {
        const axis = input.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation];
        if (input.data.has(axis)) {
            const value = input.data.get(axis).value;

            if (value[0] !== 0 || value[1] !== 0) {
                input.data.set(axis, {
                    type: InputType.TWODIM,
                    value: [0, 0],
                    lifecycleState: LifecycleValue.ENDED
                });
            }
        }
    }

};
