import { Network } from "../classes/Network";
import { SocketWebRTCClientTransport } from "@xr3ngine/engine/src/networking/classes/SocketWebRTCClientTransport";
import { MessageTypes } from "../enums/MessageTypes";
import { applyNetworkStateToClient } from "./applyNetworkStateToClient";
import { EngineProxy } from "../../EngineProxy";

/** Join the world to start interacting with it. */
export const joinWorld = async (): Promise<void> => {
  const joinWorldResponse = await (Network.instance.transport as SocketWebRTCClientTransport).instanceRequest(MessageTypes.JoinWorld.toString());
  const { worldState } = joinWorldResponse as any;
  console.log("Joined world");
  // Apply all state to initial frame
  // we can't pipe world state across worker directly, only alternative here is to convert to schema buffer and back again, or just ignore it.
  // EngineProxy.instance.applyNetworkStateToClient(worldState);
};
