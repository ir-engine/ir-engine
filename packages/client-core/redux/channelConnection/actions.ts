import {
  CHANNEL_SERVER_PROVISIONING,
  CHANNEL_SERVER_PROVISIONED,
  CHANNEL_SERVER_CONNECTING,
  CHANNEL_SERVER_CONNECTED,
  CHANNEL_SERVER_DISCONNECTED,
  SOCKET_CREATED
} from '../actions';

import { InstanceServerProvisionResult } from '@xr3ngine/common/interfaces/InstanceServerProvisionResult';

export interface ChannelServerProvisioningAction {
  type: string;
}

export interface ChannelServerProvisionedAction {
  type: string;
  ipAddress: string;
  port: string;
  channelId: string | null;
}

export interface ChannelServerConnectingAction {
  type: string;
}

export interface ChannelServerConnectedAction {
  type: string;
}

export interface ChannelServerDisconnectedAction {
  type: string;
}

export interface SocketCreatedAction {
  type: string;
  socket: any;
}

export type ChannelServerAction =
  ChannelServerProvisionedAction
  | ChannelServerProvisioningAction
  | ChannelServerConnectingAction
  | ChannelServerConnectedAction
  | ChannelServerDisconnectedAction
  | SocketCreatedAction

export function channelServerProvisioning (): ChannelServerProvisioningAction {
  return {
    type: CHANNEL_SERVER_PROVISIONING
  };
}
export function channelServerProvisioned (provisionResult: InstanceServerProvisionResult, channelId: string | null): ChannelServerProvisionedAction {
  console.log('Calling channelServerProvision');
  return {
    type: CHANNEL_SERVER_PROVISIONED,
    ipAddress: provisionResult.ipAddress,
    port: provisionResult.port,
    channelId: channelId
  };
}
export function channelServerConnecting (): ChannelServerConnectingAction {
  return {
    type: CHANNEL_SERVER_CONNECTING
  };
}

export function channelServerConnected (): ChannelServerConnectedAction {
  return {
    type: CHANNEL_SERVER_CONNECTED
  };
}

export function channelServerDisconnected (): ChannelServerDisconnectedAction {
  return {
    type: CHANNEL_SERVER_DISCONNECTED
  };
}

export function socketCreated(socket: any): SocketCreatedAction {
  return {
    type: SOCKET_CREATED,
    socket: socket
  };
}