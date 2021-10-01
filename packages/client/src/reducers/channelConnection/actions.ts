import {
  CHANNEL_SERVER_PROVISIONING,
  CHANNEL_SERVER_PROVISIONED,
  CHANNEL_SERVER_CONNECTING,
  CHANNEL_SERVER_CONNECTED,
  CHANNEL_SERVER_DISCONNECTED
} from '../actions'
import { InstanceServerProvisionResult } from '@xrengine/common/src/interfaces/InstanceServerProvisionResult'
import { SocketCreatedAction } from '../common/SocketCreatedAction'

export interface ChannelServerProvisioningAction {
  type: string
}

export interface ChannelServerProvisionedAction {
  type: string
  ipAddress: string
  port: string
  channelId: string | null
}

export interface ChannelServerConnectingAction {
  type: string
}

export interface ChannelServerConnectedAction {
  type: string
}

export interface ChannelServerDisconnectedAction {
  type: string
}

export type ChannelServerAction =
  | ChannelServerProvisionedAction
  | ChannelServerProvisioningAction
  | ChannelServerConnectingAction
  | ChannelServerConnectedAction
  | ChannelServerDisconnectedAction
  | SocketCreatedAction

export function channelServerProvisioning(): ChannelServerProvisioningAction {
  return {
    type: CHANNEL_SERVER_PROVISIONING
  }
}
export function channelServerProvisioned(
  provisionResult: InstanceServerProvisionResult,
  channelId: string | null
): ChannelServerProvisionedAction {
  console.log('Channel server provisioned')
  console.log(provisionResult)
  return {
    type: CHANNEL_SERVER_PROVISIONED,
    ipAddress: provisionResult.ipAddress,
    port: provisionResult.port,
    channelId: channelId
  }
}
export function channelServerConnecting(): ChannelServerConnectingAction {
  return {
    type: CHANNEL_SERVER_CONNECTING
  }
}

export function channelServerConnected(): ChannelServerConnectedAction {
  return {
    type: CHANNEL_SERVER_CONNECTED
  }
}

export function channelServerDisconnected(): ChannelServerDisconnectedAction {
  return {
    type: CHANNEL_SERVER_DISCONNECTED
  }
}
