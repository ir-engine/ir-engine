import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../../input/components/Input";
import { InputType } from "../../input/enums/InputType";
import { Network } from "../components/Network";

// TODO: A lot of this logic can be combined with handleInputFromServer
export function handleUpdatesFromClients() {
  console.log("handleUpdatesFromClients", Network.instance.incomingMessageQueue.getBufferLength() )
  // Parse incoming message queue
  // For each
  while (Network.instance.incomingMessageQueue.getBufferLength() > 0) {
    console.log("Handling message");
    const clientInput = Network.instance.incomingMessageQueue.pop() as any;
    if(Network.instance.networkObjects[clientInput.networkId] === undefined) return;

    // Get input component
    const input = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, Input);
    // Clear current data
    input?.data.clear();

    // Apply button input
    for (const button in clientInput.buttons)
      input?.data.set(clientInput.buttons[button].input,
        {
          type: InputType.BUTTON,
          value: clientInput.buttons[button].value,
          lifecycleState: clientInput.buttons[button].lifecycleState
        });

    // Axis 1D input
    for (const axis in clientInput.axes1d)
      input?.data.set(clientInput.axes1d[axis].input,
        {
          type: InputType.ONEDIM,
          value: clientInput.axes1d[axis].value ?? clientInput.axes1d[axis].valueX,
          lifecycleState: clientInput.axes1d[axis].lifecycleState
        });

    // Axis 2D input
    for (const axis in clientInput.axes2d)
      input?.data.set(clientInput.axes2d[axis].input,
        {
          type: InputType.TWODIM,
          value: [clientInput.axes2d[axis].valueX, clientInput.axes2d[axis].valueY],
          lifecycleState: clientInput.axes2d[axis].lifecycleState
        });

        // console.log("Input data is ", input?.data);
        // console.log("Client input is ", clientInput);
  }
}
