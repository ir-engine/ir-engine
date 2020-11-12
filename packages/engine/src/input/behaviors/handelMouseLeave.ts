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

    console.log('Mouse LEAVED Canvas');

    Object.keys(input.schema.mouseInputMap.buttons).forEach(button => {
        input.data.set(button, {
            type: InputType.BUTTON,
            value: BinaryValue.OFF,
            lifecycleState: LifecycleValue.ENDED
        });
    });

    if (input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition]) {
        input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownPosition], {
            type: InputType.TWODIM,
            value: [0, 0],
            lifecycleState: LifecycleValue.ENDED
        });
    }
    if (input.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation]) {
        input.data.set(input.schema.mouseInputMap.axes[MouseInput.MouseClickDownTransformRotation], {
            type: InputType.TWODIM,
            value: [0, 0],
            lifecycleState: LifecycleValue.ENDED
        });
    }

};
