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
import { NetworkObject } from "../components/NetworkObject";

export const sendClientInputToServer = (entity: Entity): void => {
  // Get the input component
  
};
