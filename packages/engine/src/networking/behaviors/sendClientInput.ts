/**
 * Send the client a full snapshot of current network objects
 * @param messageData Typed array buffer to be turned into message
 */

import { Entity } from "../../ecs/classes/Entity";
import { getComponent } from "../../ecs/functions/EntityFunctions";
import { Input } from "../../input/components/Input";
import { Network } from "../components/Network";
import { clientInputModel } from "../schema/clientInputSchema";

export const sendClientInput = (entity: Entity): void => {
  
  // Get the input component
  const input = getComponent(entity, Input)
  // Create a schema for input to send
  const inputs = new Array<any>()

  // Add all values in input component to schema
  for(const key in input.data.keys()) {
    inputs.push({ key: key })
  }

  // Convert to a message buffer
  const message = clientInputModel.toBuffer(inputs)

  // Add to unreliable message send queue
  Network.instance.outgoingUnreliableMessageQueue.add(message);
};
