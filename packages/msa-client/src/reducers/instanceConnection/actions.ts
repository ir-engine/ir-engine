import {
  INSTANCE_SERVER_PROVISIONING,
  INSTANCE_SERVER_PROVISIONED,
  INSTANCE_SERVER_CONNECTING,
  INSTANCE_SERVER_CONNECTED,
  INSTANCE_SERVER_DISCONNECTED
} from '../../reducers/actions'
import { InstanceServerProvisionResult } from '@xrengine/common/src/interfaces/InstanceServerProvisionResult'
import { SocketCreatedAction } from '../common/SocketCreatedAction'

export interface InstanceServerProvisioningAction {
  type: string
}

export interface InstanceServerProvisionedAction {
  type: string
  ipAddress: string
  port: string
  locationId: string | null
  sceneId: string | null
}

export interface InstanceServerConnectingAction {
  type: string
}

export interface InstanceServerConnectedAction {
  type: string
}

export interface InstanceServerDisconnectedAction {
  type: string
}

export type InstanceServerAction =
  | InstanceServerProvisionedAction
  | InstanceServerProvisioningAction
  | InstanceServerConnectingAction
  | InstanceServerConnectedAction
  | InstanceServerDisconnectedAction
  | SocketCreatedAction

export function instanceServerProvisioning(): InstanceServerProvisioningAction {
  return {
    type: INSTANCE_SERVER_PROVISIONING
  }
}
export function instanceServerProvisioned(
  provisionResult: InstanceServerProvisionResult,
  locationId: string | null,
  sceneId: string | null
): InstanceServerProvisionedAction {
  return {
    type: INSTANCE_SERVER_PROVISIONED,
    ipAddress: provisionResult.ipAddress,
    port: provisionResult.port,
    locationId: locationId,
    sceneId: sceneId
  }
}
export function instanceServerConnecting(): InstanceServerConnectingAction {
  return {
    type: INSTANCE_SERVER_CONNECTING
  }
}

export function instanceServerConnected(): InstanceServerConnectedAction {
  return {
    type: INSTANCE_SERVER_CONNECTED
  }
}

export function instanceServerDisconnected(): InstanceServerDisconnectedAction {
  return {
    type: INSTANCE_SERVER_DISCONNECTED
  }
}
