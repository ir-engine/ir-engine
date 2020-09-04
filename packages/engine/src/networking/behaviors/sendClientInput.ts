/**
 * Send the client a full snapshot of current network objects
 * @param messageData Typed array buffer to be turned into message
 */

import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../../input/components/Input";
import { Network } from "../components/Network";
import { clientInputModel } from "../schema/clientInputSchema";
import { InputType } from "../../input/enums/InputType";

export const sendClientInput = (entity: Entity): void => {

  // Get the input component
  const input = getComponent(entity, Input)
  // Create a schema for input to send
  const inputs = {
    buttons: {},
    axes1d: {},
    axes2d: {}
  }

  // Add all values in input component to schema
  for (const key in input.data.keys()) {
    switch (input.data.keys[key].type) {
      case InputType.BUTTON:
        inputs.buttons[key] = { input: key, value: input.data.keys[key].value, lifecycleState: input.data.keys[key].lifecycleState }
        break;
      case InputType.ONEDIM:
        inputs.axes1d[key] = { input: key, value: input.data.keys[key].value, lifecycleState: input.data.keys[key].lifecycleState }
        break;
      case InputType.TWODIM:
        inputs.axes2d[key] = { input: key, valueX: input.data.keys[key].value[0], valueY: input.data.keys[key].value[1], lifecycleState: input.data.keys[key].lifecycleState }
        break;
      default:
        console.error("Input type has no network handler (maybe we should add one?)")
    }
  }

  // Convert to a message buffer
  const message = clientInputModel.toBuffer(inputs)

  // Add to unreliable message send queue
  Network.instance.transport.sendUnreliableMessage(message);
};
