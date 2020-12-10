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
    let clientInput = null;

    if (Network.instance.packetCompression) {
      clientInput = clientInputModel.fromBuffer(new Uint8Array(buffer).buffer);
    } else {
      clientInput = buffer;
    }

  //@ts-ignore
      if(Network.instance.networkObjects[clientInput.networkId] === undefined) return;
  //@ts-ignore
      const actor = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, CharacterComponent);
      actor.viewVector.set(
  //@ts-ignore
        clientInput.viewVector.x,
  //@ts-ignore
        clientInput.viewVector.y,
  //@ts-ignore
        clientInput.viewVector.z
      )
      // Get input component
  //@ts-ignore
      const input = getMutableComponent(Network.instance.networkObjects[clientInput.networkId].component.entity, Input);
      // Clear current data
      input?.data.clear();

      // Apply button input


    //@ts-ignore
      for (let i = 0; i < clientInput.buttons.length; i++)
  //@ts-ignore
        input?.data.set(clientInput.buttons[i].input,
          {
            type: InputType.BUTTON,
  //@ts-ignore
            value: clientInput.buttons[i].value,
  //@ts-ignore
            lifecycleState: clientInput.buttons[i].lifecycleState
          });

      // Axis 1D input
  //@ts-ignore
        for (let i = 0; i < clientInput.axes1d.length; i++)
  //@ts-ignore
        input?.data.set(clientInput.axes1d[i].input,
          {
            type: InputType.ONEDIM,
  //@ts-ignore
            value: clientInput.axes1d[i].value ?? clientInput.axes1d[i].valueX,
  //@ts-ignore
            lifecycleState: clientInput.axes1d[i].lifecycleState
          });

          // Axis 2D input
  //@ts-ignore
      for (let i = 0; i < clientInput.axes2d.length; i++)
  //@ts-ignore
        input?.data.set(clientInput.axes2d[i].input,
          {
            type: InputType.TWODIM,
  //@ts-ignore
            value: [clientInput.axes2d[i].valueX, clientInput.axes2d[i].valueY],
  //@ts-ignore
            lifecycleState: clientInput.axes2d[i].lifecycleState
          });

  }
}
