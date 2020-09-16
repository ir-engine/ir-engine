/**
 * Send the client a full snapshot of current network objects
 * @param messageData Typed array buffer to be turned into message
 */

import { LifecycleValue } from "../../common/enums/LifecycleValue";
import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../../input/components/Input";
import { InputType } from "../../input/enums/InputType";
import { Network } from "../components/Network";

export const sendClientInput = (entity: Entity): void => {

  // Get the input component
  const input = getComponent(entity, Input)
  if (input.data.size < 1) return
  // console.log(input.data)
  // Create a schema for input to send
  const inputs = {
    buttons: {},
    axes1d: {},
    axes2d: {}
  }

  let numInputs = 0

  // Add all values in input component to schema
  for (const key in input.data.keys()) {
    switch (input.data.keys[key].type) {
      case InputType.BUTTON:
        inputs.buttons[key] = { input: key, value: input.data.keys[key].value, lifecycleState: input.data.keys[key].lifecycleState }
        numInputs++
        break;
      case InputType.ONEDIM:
        if (input.data.keys[key].lifecycleState !== LifecycleValue.UNCHANGED) {
          inputs.axes1d[key] = { input: key, value: input.data.keys[key].value, lifecycleState: input.data.keys[key].lifecycleState }
          numInputs++
        }
        break;
      case InputType.TWODIM:
        if (input.data.keys[key].lifecycleState !== LifecycleValue.UNCHANGED) {
          inputs.axes2d[key] = { input: key, valueX: input.data.keys[key].value[0], valueY: input.data.keys[key].value[1], lifecycleState: input.data.keys[key].lifecycleState }
          numInputs++
        }
        break;
      default:
        console.error("Input type has no network handler (maybe we should add one?)")
    }
  }

  if (numInputs < 1) return

  // Convert to a message buffer
  const message = inputs // clientInputModel.toBuffer(inputs)

  // TODO: Send unreliably
  Network.instance.transport.sendReliableData(message); // Use default channel
};
