import { getMutableComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../../input/components/Input";
import { InputType } from "../../input/enums/InputType";
import { CharacterComponent } from "../../templates/character/components/CharacterComponent";
import { Network } from "../components/Network";
import { ClientInputModel } from '../schema/clientInputSchema';
import { NetworkInputInterface } from "../interfaces/WorldState";

export function handleUpdatesFromClients(): void {
  // Parse incoming message queue
  while (Network.instance.incomingMessageQueue.getBufferLength() > 0) {
    const buffer = Network.instance.incomingMessageQueue.pop() as any;
    let clientInput: NetworkInputInterface = null;

    if (Network.instance.packetCompression) {
      clientInput = ClientInputModel.fromBuffer(new Uint8Array(buffer).buffer);
    } else {
      clientInput = buffer;
    }

    if (Network.instance.networkObjects[clientInput.networkId] === undefined) {
      console.error('Network object not found for networkId', clientInput.networkId);
      return;
    }

    const actor = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, CharacterComponent);
    actor.viewVector.set(
      clientInput.viewVector.x,
      clientInput.viewVector.y,
      clientInput.viewVector.z
    );

    // Get input component
    const input = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, Input);
    if (!input) {
      return;
    }

    // Clear current data
    input.data.clear();

    // Apply button input
    for (let i = 0; i < clientInput.buttons.length; i++)
      input.data.set(clientInput.buttons[i].input,
        {
          type: InputType.BUTTON,
          value: clientInput.buttons[i].value,
          lifecycleState: clientInput.buttons[i].lifecycleState
        });

    // Axis 1D input
    for (let i = 0; i < clientInput.axes1d.length; i++)
      input.data.set(clientInput.axes1d[i].input,
        {
          type: InputType.ONEDIM,
          value: clientInput.axes1d[i].value,
          lifecycleState: clientInput.axes1d[i].lifecycleState
        });

    // Axis 2D input
    for (let i = 0; i < clientInput.axes2d.length; i++)
      input.data.set(clientInput.axes2d[i].input,
        {
          type: InputType.TWODIM,
          value: clientInput.axes2d[i].value,
          lifecycleState: clientInput.axes2d[i].lifecycleState
        });

  }
}
