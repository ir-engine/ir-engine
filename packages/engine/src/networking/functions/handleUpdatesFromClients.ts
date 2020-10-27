import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../../input/components/Input";
import { InputType } from "../../input/enums/InputType";
import { Network } from "../components/Network";

// TODO: A lot of this logic can be combined with handleInputFromServer
export function handleUpdatesFromClients() {
  // Parse incoming message queue
  // For each
  while (Network.instance.incomingMessageQueue.getBufferLength() > 0) {
    const clientInput = Network.instance.incomingMessageQueue.pop() as any;

    if(clientInput === undefined) return console.warn("Input is undefined, this might be because it was destroyed this frame");
    if(Network.instance.networkObjects[clientInput.networkId] === undefined) return

    // Get input component
    const input = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, Input);

    // Clear current data
    input.data.clear();

    // Apply button input
    for (const button in clientInput.buttons) {
      input.data.set(clientInput.buttons[button].input,
        {
          type: InputType.BUTTON,
          value: clientInput.buttons[button].value,
          lifecycleState: clientInput.buttons[button].lifeCycleState
        });
    }

    // Axis 1D input
    for (const axis in clientInput.axes1d) {
      input.data.set(clientInput.axes1d[axis].input,
        {
          type: InputType.BUTTON,
          value: clientInput.axes1d[axis].value,
          lifecycleState: clientInput.axes1d[axis].lifeCycleState
        });
    }

    // Axis 2D input
    for (const axis in clientInput.axes2d) {
      input.data.set(clientInput.axes2d[axis].input,
        {
          type: InputType.BUTTON,
          value: clientInput.axes2d[axis].value,
          lifecycleState: clientInput.axes2d[axis].lifeCycleState
        });
    }
  }
}
