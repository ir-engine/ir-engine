import { Network } from "../components/Network";
import { SocketWebRTCClientTransport } from "@xr3ngine/client/classes/transports/SocketWebRTCClientTransport";
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
