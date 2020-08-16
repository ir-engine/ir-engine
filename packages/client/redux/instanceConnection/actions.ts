import {
  INSTANCE_SERVER_PROVISIONED,
  INSTANCE_SERVER_CONNECTED,
  INSTANCE_SERVER_DISCONNECTED
} from '../actions'

import { InstanceServerProvisionResult } from '@xr3ngine/common'

export interface InstanceServerProvisionedAction {
  type: string
  ipAddress: string
  port: string
  locationId: string
}

export interface InstanceServerConnectedAction {
  type: string
}

export interface InstanceServerDisconnectedAction {
  type: string
}

export type InstanceServerAction =
  InstanceServerProvisionedAction
  | InstanceServerConnectedAction
  | InstanceServerDisconnectedAction

export function instanceServerProvisioned (provisionResult: InstanceServerProvisionResult, locationId: string): InstanceServerProvisionedAction {
  return {
    type: INSTANCE_SERVER_PROVISIONED,
    ipAddress: provisionResult.ipAddress,
    port: provisionResult.port,
    locationId: locationId
  }
}
export function instanceServerConnected (): InstanceServerConnectedAction {
  return {
    type: INSTANCE_SERVER_CONNECTED
  }
}

export function instanceServerDisconnected (): InstanceServerDisconnectedAction {
  return {
    type: INSTANCE_SERVER_DISCONNECTED
  }
}
