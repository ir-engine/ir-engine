import { endVideoChat, leave } from '../../transports/SocketWebRTCClientFunctions'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { accessAuthState } from '../../user/services/AuthService'
import { Config } from '@xrengine/common/src/config'
import { client } from '../../feathers'
import { store } from '../../store'
import { accessChatState } from '../../social/services/ChatService'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { accessLocationState } from '../../social/services/LocationService'
import { MediaStreamService } from '../../media/services/MediaStreamService'

import { createState, DevTools, useState, none, Downgraded } from '@hookstate/core'
import { InstanceServerProvisionResult } from '@xrengine/common/src/interfaces/InstanceServerProvisionResult'

//State
const state = createState({
  instance: {
    ipAddress: '',
    port: ''
  },
  socket: {},
  locationId: '',
  sceneId: '',
  channelId: '',
  instanceProvisioned: false,
  connected: false,
  readyToConnect: false,
  updateNeeded: false,
  instanceServerConnecting: false,
  instanceProvisioning: false
})

let connectionSocket = null

store.receptors.push((action: ChannelConnectionActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'CHANNEL_SERVER_PROVISIONING':
        return s.merge({
          instance: s.instance.value,
          socket: {},
          connected: false,
          instanceProvisioned: false,
          readyToConnect: false,
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
          connected: false
        })
      case 'CHANNEL_SERVER_CONNECTING':
        return s.merge({
          instanceServerConnecting: true
        })
      case 'CHANNEL_SERVER_CONNECTED':
        return s.merge({ connected: true, instanceServerConnecting: false, updateNeeded: false, readyToConnect: false })
      case 'CHANNEL_SERVER_DISCONNECTED':
        if (connectionSocket != null) (connectionSocket as any).close()
        return s.merge({
          instance: s.instance.value,
          socket: s.socket.value,
          locationId: s.locationId.value,
          sceneId: s.sceneId.value,
          channelId: s.channelId.value,
          instanceProvisioned: s.instanceProvisioned.value,
          connected: s.connected.value,
          readyToConnect: s.readyToConnect.value,
          updateNeeded: s.updateNeeded.value,
          instanceServerConnecting: s.instanceServerConnecting.value,
          instanceProvisioning: s.instanceProvisioning.value
        })
      case 'SOCKET_CREATED':
        if (connectionSocket != null) (connectionSocket as any).close()
        connectionSocket = action.socket
        return state
    }
  }, action.type)
})

export const accessChannelConnectionState = () => state

export const useChannelConnectionState = () => useState(state) as any as typeof state

//Service
export const ChannelConnectionService = {
  provisionChannelServer: async (channelId?: string) => {
    store.dispatch(ChannelConnectionAction.channelServerProvisioning())
    const token = accessAuthState().authUser.accessToken.value
    const provisionResult = await client.service('instance-provision').find({
      query: {
        channelId: channelId,
        token: token
      }
    })
    if (provisionResult.ipAddress != null && provisionResult.port != null) {
      store.dispatch(ChannelConnectionAction.channelServerProvisioned(provisionResult, channelId))
    } else {
      EngineEvents.instance.dispatchEvent({
        type: SocketWebRTCClientTransport.EVENTS.PROVISION_CHANNEL_NO_GAMESERVERS_AVAILABLE
      })
    }
  },
  connectToChannelServer: async (channelId: string, isHarmonyPage?: boolean) => {
    try {
      store.dispatch(ChannelConnectionAction.channelServerConnecting())
      const authState = accessAuthState()
      const user = authState.user.value
      const token = authState.authUser.accessToken.value
      const chatState = accessChatState()
      const channelState = chatState.channels
      const channels = channelState.channels.value
      const channelEntries = Object.entries(channels)
      const instanceChannel = channelEntries.find((entry) => entry[1].instanceId != null)
      const channelConnectionState = accessChannelConnectionState().value
      const instance = channelConnectionState.instance
      const locationId = channelConnectionState.locationId
      const locationState = accessLocationState()

      const currentLocation = locationState.currentLocation.location
      const sceneId = currentLocation?.sceneId?.value
      const videoActive =
        MediaStreams !== null &&
        MediaStreams !== undefined &&
        (MediaStreams.instance?.camVideoProducer != null || MediaStreams.instance?.camAudioProducer != null)
      // TODO: Disconnected
      if (Network.instance !== undefined && Network.instance !== null) {
        await endVideoChat({ endConsumers: true })
        await leave(false)
      }

      try {
        const ipAddress = instance.ipAddress
        const port = Number(instance.port)
        await Network.instance.transport.initialize(ipAddress, port, false, {
          locationId: locationId,
          token: token,
          user: user,
          sceneId: sceneId,
          startVideo: videoActive,
          channelType: instanceChannel && channelId === instanceChannel[1].id ? 'instance' : 'channel',
          channelId: channelId,
          videoEnabled:
            currentLocation?.locationSettings?.videoEnabled?.value === true ||
            !(
              currentLocation?.locationSettings?.locationType?.value === 'showroom' &&
              user.locationAdmins?.find((locationAdmin) => locationAdmin.locationId === currentLocation?.id?.value) ==
              null
            ),
          isHarmonyPage: isHarmonyPage
        })
      } catch (error) {
        console.error('Network transport could not initialize, transport is: ', Network.instance.transport)
        console.log(error)
      }

      ; (Network.instance.transport as SocketWebRTCClientTransport).left = false
      EngineEvents.instance.addEventListener(
        MediaStreams.EVENTS.TRIGGER_UPDATE_CONSUMERS,
        MediaStreamService.triggerUpdateConsumers
      )

      MediaStreams.instance.channelType =
        instanceChannel && channelId === instanceChannel[1].id ? 'instance' : 'channel'
      MediaStreams.instance.channelId = channelId
      store.dispatch(ChannelConnectionAction.channelServerConnected())
    } catch (err) {
      console.log(err)
    }
  },
  resetChannelServer: () => {
    const channelRequest = (Network.instance?.transport as any)?.channelRequest
    if (channelRequest != null) (Network.instance.transport as any).channelRequest = null
    store.dispatch(ChannelConnectionAction.channelServerDisconnected())
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('instance-provision').on('created', (params) => {
    if (params.channelId != null)
      store.dispatch(ChannelConnectionAction.channelServerProvisioned(params, params.channelId))
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
