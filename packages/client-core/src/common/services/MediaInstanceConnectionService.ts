import { endVideoChat, leave } from '../../transports/SocketWebRTCClientFunctions'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { accessAuthState } from '../../user/services/AuthService'
import { client } from '../../feathers'
import { store, useDispatch } from '../../store'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { accessLocationState } from '../../social/services/LocationService'
import { MediaStreamService } from '../../media/services/MediaStreamService'

import { createState, useState } from '@speigg/hookstate'
import { InstanceServerProvisionResult } from '@xrengine/common/src/interfaces/InstanceServerProvisionResult'
import { ChannelType } from '@xrengine/common/src/interfaces/Channel'

//State
const state = createState({
  instance: {
    ipAddress: '',
    port: ''
  },
  locationId: '',
  sceneId: '',
  channelType: null! as ChannelType,
  channelId: '',
  videoEnabled: false,
  provisioned: false,
  connected: false,
  readyToConnect: false,
  updateNeeded: false,
  connecting: false,
  provisioning: false
})

store.receptors.push((action: MediaLocationInstanceConnectionActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'MEDIA_INSTANCE_SERVER_PROVISIONING':
        return s.merge({
          connected: false,
          provisioned: false,
          readyToConnect: false,
          provisioning: true
        })
      case 'MEDIA_INSTANCE_SERVER_PROVISIONED':
        MediaStreams.instance.channelType = action.channelType!
        MediaStreams.instance.channelId = action.channelId!
        return s.merge({
          instance: {
            ipAddress: action.ipAddress,
            port: action.port
          },
          channelType: action.channelType,
          channelId: action.channelId!,
          provisioning: false,
          provisioned: true,
          readyToConnect: true,
          updateNeeded: true,
          connected: false
        })
      case 'MEDIA_INSTANCE_SERVER_CONNECTING':
        return s.connecting.set(true)
      case 'MEDIA_INSTANCE_SERVER_CONNECTED':
        return s.merge({
          connected: true,
          updateNeeded: false,
          readyToConnect: false,
          connecting: false
        })
      case 'MEDIA_INSTANCE_SERVER_VIDEO_ENABLED':
        return s.merge({
          videoEnabled: action.enableVideo
        })
      case 'MEDIA_INSTANCE_SERVER_DISCONNECT':
        MediaStreams.instance.channelType = null!
        MediaStreams.instance.channelId = ''
        return s.merge({
          instance: {
            ipAddress: '',
            port: ''
          },
          locationId: '',
          sceneId: '',
          channelType: null!,
          channelId: '',
          provisioned: false,
          connected: false,
          readyToConnect: false,
          updateNeeded: false,
          connecting: false,
          provisioning: false
        })
    }
  }, action.type)
})

export const accessMediaInstanceConnectionState = () => state

export const useMediaInstanceConnectionState = () => useState(state) as any as typeof state

//Service
export const MediaInstanceConnectionService = {
  provisionServer: async (channelId?: string, isWorldConnection = false) => {
    const dispatch = useDispatch()
    dispatch(MediaLocationInstanceConnectionAction.serverProvisioning())
    const token = accessAuthState().authUser.accessToken.value
    const provisionResult = await client.service('instance-provision').find({
      query: {
        channelId: channelId,
        token: token
      }
    })
    if (provisionResult.ipAddress && provisionResult.port) {
      {
        dispatch(
          MediaLocationInstanceConnectionAction.serverProvisioned(
            provisionResult,
            channelId,
            isWorldConnection ? 'instance' : 'channel'
          )
        )
      }
    } else {
      EngineEvents.instance.dispatchEvent({
        type: SocketWebRTCClientTransport.EVENTS.PROVISION_CHANNEL_NO_GAMESERVERS_AVAILABLE
      })
    }
  },
  connectToServer: async (channelId: string) => {
    const dispatch = useDispatch()
    dispatch(MediaLocationInstanceConnectionAction.serverConnecting())
    const authState = accessAuthState()
    const user = authState.user.value
    const { ipAddress, port } = accessMediaInstanceConnectionState().instance.value

    const locationState = accessLocationState()
    const currentLocation = locationState.currentLocation.location
    const sceneId = currentLocation?.sceneId?.value

    const transport = Network.instance.transportHandler.getMediaTransport() as SocketWebRTCClientTransport
    if (transport.socket) {
      await endVideoChat(transport, { endConsumers: true })
      await leave(transport, false)
    }

    dispatch(
      MediaLocationInstanceConnectionAction.enableVideo(
        currentLocation?.locationSettings?.videoEnabled?.value === true ||
          !(
            currentLocation?.locationSettings?.locationType?.value === 'showroom' &&
            user.locationAdmins?.find((locationAdmin) => locationAdmin.locationId === currentLocation?.id?.value) ==
              null
          )
      )
    )

    await transport.initialize({ sceneId, port, ipAddress, channelId })
    transport.left = false
    EngineEvents.instance.addEventListener(
      MediaStreams.EVENTS.TRIGGER_UPDATE_CONSUMERS,
      MediaStreamService.triggerUpdateConsumers
    )
  },
  resetServer: () => {
    const dispatch = useDispatch()
    dispatch(MediaLocationInstanceConnectionAction.disconnect())
  }
}

if (globalThis.process.env['VITE_OFFLINE_MODE'] !== 'true') {
  client.service('instance-provision').on('created', (params) => {
    if (params.channelId != null) {
      const dispatch = useDispatch()
      dispatch(MediaLocationInstanceConnectionAction.serverProvisioned(params, params.channelId))
    }
  })
}

//Action
export const MediaLocationInstanceConnectionAction = {
  serverProvisioning: () => {
    return {
      type: 'MEDIA_INSTANCE_SERVER_PROVISIONING' as const
    }
  },
  serverProvisioned: (
    provisionResult: InstanceServerProvisionResult,
    channelId?: string,
    channelType?: ChannelType
  ) => {
    return {
      type: 'MEDIA_INSTANCE_SERVER_PROVISIONED' as const,
      id: provisionResult.id,
      ipAddress: provisionResult.ipAddress,
      port: provisionResult.port,
      channelType: channelType,
      channelId: channelId
    }
  },
  serverConnecting: () => {
    return {
      type: 'MEDIA_INSTANCE_SERVER_CONNECTING' as const
    }
  },
  serverConnected: () => {
    return {
      type: 'MEDIA_INSTANCE_SERVER_CONNECTED' as const
    }
  },
  enableVideo: (enableVideo: boolean) => {
    return {
      type: 'MEDIA_INSTANCE_SERVER_VIDEO_ENABLED' as const,
      enableVideo
    }
  },
  disconnect: () => {
    return {
      type: 'MEDIA_INSTANCE_SERVER_DISCONNECT' as const
    }
  }
}

export type MediaLocationInstanceConnectionActionType = ReturnType<
  typeof MediaLocationInstanceConnectionAction[keyof typeof MediaLocationInstanceConnectionAction]
>
