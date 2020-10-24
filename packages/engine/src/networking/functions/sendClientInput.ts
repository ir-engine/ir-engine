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
  const input = getComponent(entity, Input);
  if (input.data.size < 1) return;
  // Create a schema for input to send
  const inputs = {
    buttons: {},
    axes1d: {},
    axes2d: {}
  };

  let numInputs = 0;

  // TODO: Parse entries and examine how map is working
  // We need to add these inputs properly!

  console.log(input.data.entries())

  // Add all values in input component to schema
  for (let [key, value] of input.data.entries()) {

    switch (value.type) {
      case InputType.BUTTON:
        inputs.buttons[key] = { input: key, value: value.value, lifecycleState: value.lifecycleState };
        numInputs++;
        break;
      case InputType.ONEDIM:
        if (value.lifecycleState !== LifecycleValue.UNCHANGED) {
          inputs.axes1d[key] = { input: key, value: value.value, lifecycleState: value.lifecycleState };
          numInputs++;
        }
        break;
      case InputType.TWODIM:
        if (value.lifecycleState !== LifecycleValue.UNCHANGED) {
          inputs.axes2d[key] = { input: key, valueX: value.value[0], valueY: value.value[1], lifecycleState: value.lifecycleState };
          numInputs++;
        }
        break;
      default:
        console.error("Input type has no network handler (maybe we should add one?)");
    }
  }

  console.log("numInputs", numInputs)
  if (numInputs < 1) return;

  console.log("INPUTS: ", inputs)
  // Convert to a message buffer
  const message = inputs; // clientInputModel.toBuffer(inputs)

  // TODO: Send unreliably
  Network.instance.transport.sendReliableData(message); // Use default channel
};
