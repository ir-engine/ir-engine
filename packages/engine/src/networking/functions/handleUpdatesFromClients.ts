import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../../input/components/Input";
import { InputType } from "../../input/enums/InputType";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { Network } from "../components/Network";
import { clientInputModel } from '../schema/clientInputSchema';

export function handleUpdatesFromClients() {
  // Parse incoming message queue
  while (Network.instance.incomingMessageQueue.getBufferLength() > 0) {
    const buffer = Network.instance.incomingMessageQueue.pop() as any;
    const clientInput = clientInputModel.fromBuffer(new Uint8Array(buffer).buffer);

    clientInput.buttons = clientInput.buttons?.reduce((a,b) => Object.assign(a, {[b.input]:b} ),{})
    clientInput.axes2d = clientInput.axes2d?.reduce((a,b) => Object.assign(a, {[b.input]:b} ),{})
    clientInput.axes1d = clientInput.axes1d?.reduce((a,b) => Object.assign(a, {[b.input]:b} ),{})

    if(Network.instance.networkObjects[clientInput.networkId] === undefined) return;

    const actor = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, CharacterComponent);
    actor.viewVector.set(
      clientInput.viewVector.x,
      clientInput.viewVector.y,
      clientInput.viewVector.z
    )
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
  }
}
