import { InstanceServerProvisionResult } from '@xrengine/common/src/interfaces/InstanceServerProvisionResult'

export const InstanceConnectionAction = {
  instanceServerProvisioning: () => {
    return {
      type: 'INSTANCE_SERVER_PROVISIONING' as const
    }
  },
  instanceServerProvisioned: (
    provisionResult: InstanceServerProvisionResult,
    locationId: string | null,
    sceneId: string | null
  ) => {
    return {
      type: 'INSTANCE_SERVER_PROVISIONED' as const,
      ipAddress: provisionResult.ipAddress,
      port: provisionResult.port,
      locationId: locationId,
      sceneId: sceneId
    }
  },
  instanceServerConnecting: () => {
    return {
      type: 'INSTANCE_SERVER_CONNECTING' as const
    }
  },
  instanceServerConnected: () => {
    return {
      type: 'INSTANCE_SERVER_CONNECTED' as const
    }
  },
  instanceServerDisconnected: () => {
    return {
      type: 'INSTANCE_SERVER_DISCONNECTED' as const
    }
  },
  socketCreated: (socket: any) => {
    return {
      type: 'SOCKET_CREATED' as const,
      socket: socket
    }
  }
}

export type InstanceConnectionActionType = ReturnType<
  typeof InstanceConnectionAction[keyof typeof InstanceConnectionAction]
>
