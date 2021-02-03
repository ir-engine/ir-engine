import { Network } from "../classes/Network";
import { SocketWebRTCClientTransport } from "@xr3ngine/engine/src/networking/classes/SocketWebRTCClientTransport";
import { MessageTypes } from "../enums/MessageTypes";
import { applyNetworkStateToClient } from "./applyNetworkStateToClient";

/** Join the world to start interacting with it. */
export const joinWorld = async (): Promise<void> => {
  const joinWorldResponse = await (Network.instance.transport as SocketWebRTCClientTransport).request(MessageTypes.JoinWorld.toString());
  const { worldState } = joinWorldResponse as any;
  console.log("Joined world");
  // Apply all state to initial frame
  applyNetworkStateToClient(worldState);
};
