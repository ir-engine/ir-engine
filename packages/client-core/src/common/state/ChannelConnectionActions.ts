import { InstanceServerProvisionResult } from '@xrengine/common/src/interfaces/InstanceServerProvisionResult'

export const ChannelConnectionAction = {
  channelServerProvisioning: () => {
    return {
      type: 'CHANNEL_SERVER_PROVISIONING' as const
    }
  },
  channelServerProvisioned: (provisionResult: InstanceServerProvisionResult, channelId?: string | null) => {
    return {
      type: 'CHANNEL_SERVER_PROVISIONED' as const,
      ipAddress: provisionResult.ipAddress,
      port: provisionResult.port,
      channelId: channelId
    }
  },
  channelServerConnecting: () => {
    return {
      type: 'CHANNEL_SERVER_CONNECTING' as const
    }
  },
  channelServerConnected: () => {
    return {
      type: 'CHANNEL_SERVER_CONNECTED' as const
    }
  },
  channelServerDisconnected: () => {
    return {
      type: 'CHANNEL_SERVER_DISCONNECTED' as const
    }
  },
  socketCreated: (socket: any) => {
    return {
      type: 'SOCKET_CREATED' as const,
      socket: socket
    }
  }
}

export type ChannelConnectionActionType = ReturnType<
  typeof ChannelConnectionAction[keyof typeof ChannelConnectionAction]
>
