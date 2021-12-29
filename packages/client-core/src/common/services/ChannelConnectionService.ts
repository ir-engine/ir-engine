import { endVideoChat, leave } from '../../transports/SocketWebRTCClientFunctions'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { accessAuthState } from '../../user/services/AuthService'
import { Config } from '@xrengine/common/src/config'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { accessChatState } from '../../social/services/ChatService'
import {
  SocketWebRTCClientMediaTransport,
  SocketWebRTCClientTransport
} from '../../transports/SocketWebRTCClientTransport'
import { accessLocationState } from '../../social/services/LocationService'
import { MediaStreamService } from '../../media/services/MediaStreamService'

import { createState, useState } from '@hookstate/core'
import { InstanceServerProvisionResult } from '@xrengine/common/src/interfaces/InstanceServerProvisionResult'
import { accessInstanceConnectionState } from '@xrengine/client-core/src/common/services/InstanceConnectionService'

//State
const state = createState({
  instance: {
    ipAddress: '',
    port: ''
  },
  locationId: '',
  sceneId: '',
  channelId: '',
  instanceProvisioned: false,
  connected: false,
  readyToConnect: false,
  updateNeeded: false,
  instanceServerConnecting: false,
  instanceProvisioning: false,
  channelDisconnected: true
})

store.receptors.push((action: ChannelConnectionActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'CHANNEL_SERVER_PROVISIONING':
        return s.merge({
          connected: false,
          instanceProvisioned: false,
          readyToConnect: false,
          channelDisconnected: true,
          instanceProvisioning: true
        })
      case 'CHANNEL_SERVER_PROVISIONED':
        return s.merge({
          instance: {
            ipAddress: action.ipAddress,
            port: action.port
          },
          channelId: action.channelId!,
          instanceProvisioning: false,
          instanceProvisioned: true,
          readyToConnect: true,
          updateNeeded: true,
          channelDisconnected: true,
          connected: false
        })
      case 'CHANNEL_SERVER_CONNECTING':
        return s.instanceServerConnecting.set(true)
      case 'CHANNEL_SERVER_CONNECTED':
        return s.merge({
          connected: true,
          updateNeeded: false,
          readyToConnect: false,
          channelDisconnected: false,
          instanceServerConnecting: false
        })
      case 'CHANNEL_SERVER_DISCONNECT':
        return s.merge({
          instance: {
            ipAddress: '',
            port: ''
          },
          locationId: '',
          sceneId: '',
          channelId: '',
          instanceProvisioned: false,
          connected: false,
          readyToConnect: false,
          updateNeeded: false,
          channelDisconnected: true,
          instanceServerConnecting: false,
          instanceProvisioning: false
        })
    }
  }, action.type)
})

export const accessChannelConnectionState = () => state

export const useChannelConnectionState = () => useState(state) as any as typeof state

//Service
export const ChannelConnectionService = {
  provisionChannelServer: async (channelId?: string) => {
    const dispatch = useDispatch()
    dispatch(ChannelConnectionAction.channelServerProvisioning())
    const token = accessAuthState().authUser.accessToken.value
    const provisionResult = await client.service('instance-provision').find({
      query: {
        channelId: channelId,
        token: token
      }
    })
    if (provisionResult.ipAddress && provisionResult.port) {
      dispatch(ChannelConnectionAction.channelServerProvisioned(provisionResult, channelId))
    } else {
      EngineEvents.instance.dispatchEvent({
        type: SocketWebRTCClientTransport.EVENTS.PROVISION_CHANNEL_NO_GAMESERVERS_AVAILABLE
      })
    }
  },
  connectToChannelServer: async (channelId: string) => {
    const dispatch = useDispatch()
    dispatch(ChannelConnectionAction.channelServerConnecting())
    const authState = accessAuthState()
    const user = authState.user.value
    const chatState = accessChatState()
    const channelState = chatState.channels
    const channels = channelState.channels.value
    const channelEntries = Object.entries(channels)
    const instanceChannel = channelEntries.find(
      (entry) => entry[1].instanceId === accessInstanceConnectionState().instance.id.value
    )
    const { ipAddress, port } = accessChannelConnectionState().instance.value

    const locationState = accessLocationState()
    const currentLocation = locationState.currentLocation.location
    const sceneId = currentLocation?.sceneId?.value

    const transport = Network.instance.transportHandler.getMediaTransport() as SocketWebRTCClientMediaTransport
    if (transport.socket) {
      await endVideoChat(transport, { endConsumers: true })
      await leave(transport, false)
    }

    transport.videoEnabled =
      currentLocation?.locationSettings?.videoEnabled?.value === true ||
      !(
        currentLocation?.locationSettings?.locationType?.value === 'showroom' &&
        user.locationAdmins?.find((locationAdmin) => locationAdmin.locationId === currentLocation?.id?.value) == null
      )
    transport.channelType = instanceChannel && channelId === instanceChannel[1].id ? 'instance' : 'channel'
    transport.channelId = channelId

    await transport.initialize({ sceneId, port, ipAddress, channelId })
    transport.left = false
    EngineEvents.instance.addEventListener(
      MediaStreams.EVENTS.TRIGGER_UPDATE_CONSUMERS,
      MediaStreamService.triggerUpdateConsumers
    )

    MediaStreams.instance.channelType = instanceChannel && channelId === instanceChannel[1].id ? 'instance' : 'channel'
    MediaStreams.instance.channelId = channelId
  },
  resetChannelServer: () => {
    const dispatch = useDispatch()
    dispatch(ChannelConnectionAction.disconnect())
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('instance-provision').on('created', (params) => {
    if (params.channelId != null) {
      const dispatch = useDispatch()
      dispatch(ChannelConnectionAction.channelServerProvisioned(params, params.channelId))
    }
  })
}

//Action
export const ChannelConnectionAction = {
  channelServerProvisioning: () => {
    return {
      type: 'CHANNEL_SERVER_PROVISIONING' as const
    }
  },
  channelServerProvisioned: (provisionResult: InstanceServerProvisionResult, channelId?: string | null) => {
    return {
      type: 'CHANNEL_SERVER_PROVISIONED' as const,
      id: provisionResult.id,
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
  disconnect: () => {
    return {
      type: 'CHANNEL_SERVER_DISCONNECT' as const
    }
  }
}

export type ChannelConnectionActionType = ReturnType<
  typeof ChannelConnectionAction[keyof typeof ChannelConnectionAction]
>
