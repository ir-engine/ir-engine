import { Downgraded, none } from '@hookstate/core'
import { useEffect } from 'react'

import { ChannelType } from '@xrengine/common/src/interfaces/Channel'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import multiLogger from '@xrengine/common/src/logger'
import { matches, matchesUserId, Validator } from '@xrengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { NetworkTopics } from '@xrengine/engine/src/networking/classes/Network'
import { defineAction, defineState, dispatchAction, getState, useState } from '@xrengine/hyperflux'

import { API } from '../../API'
import { accessChatState } from '../../social/services/ChatService'
import { accessLocationState } from '../../social/services/LocationService'
import { endVideoChat, leaveNetwork } from '../../transports/SocketWebRTCClientFunctions'
import { SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientNetwork'
import { accessAuthState } from '../../user/services/AuthService'
import { NetworkConnectionService } from './NetworkConnectionService'

const logger = multiLogger.child({ component: 'client-core:service:media-instance' })

type InstanceState = {
  ipAddress: string
  port: string
  channelType: ChannelType
  channelId: string
  roomCode: string
  videoEnabled: boolean
  provisioned: boolean
  connected: boolean
  readyToConnect: boolean
  connecting: boolean
}

//State
const MediaInstanceState = defineState({
  name: 'MediaInstanceState',
  initial: () => ({
    instances: {} as { [id: string]: InstanceState },
    joiningNonInstanceMediaChannel: false
  })
})

export const MediaInstanceConnectionServiceReceptor = (action) => {
  const s = getState(MediaInstanceState)
  matches(action)
    .when(MediaInstanceConnectionAction.serverProvisioned.matches, (action) => {
      Engine.instance.currentWorld._mediaHostId = action.instanceId
      Engine.instance.currentWorld.networks.set(
        action.instanceId,
        new SocketWebRTCClientNetwork(action.instanceId, NetworkTopics.media)
      )
      return s.instances[action.instanceId].set({
        ipAddress: action.ipAddress,
        port: action.port,
        channelType: action.channelType!,
        channelId: action.channelId!,
        roomCode: action.roomCode,
        videoEnabled: false,
        provisioned: true,
        readyToConnect: true,
        connected: false,
        connecting: false
      })
    })
    .when(MediaInstanceConnectionAction.serverConnecting.matches, (action) => {
      return s.instances[action.instanceId].connecting.set(true)
    })
    .when(MediaInstanceConnectionAction.serverConnected.matches, (action) => {
      s.joiningNonInstanceMediaChannel.set(false)
      return s.instances[action.instanceId].merge({
        connected: true,
        connecting: false,
        readyToConnect: false
      })
    })
    .when(MediaInstanceConnectionAction.enableVideo.matches, (action) => {
      return s.instances[action.instanceId].merge({
        videoEnabled: action.enableVideo
      })
    })
    .when(MediaInstanceConnectionAction.disconnect.matches, (action) => {
      return s.instances[action.instanceId].set(none)
    })
    .when(MediaInstanceConnectionAction.joiningNonInstanceMediaChannel.matches, (action) => {
      return s.joiningNonInstanceMediaChannel.set(true)
    })
    .when(MediaInstanceConnectionAction.changeActiveConnectionHostId.matches, (action) => {
      const currentNetwork = s.instances[action.currentInstanceId].get({ noproxy: true })
      Engine.instance.currentWorld.mediaNetwork.hostId = action.newInstanceId as UserId
      Engine.instance.currentWorld.networks.set(action.newInstanceId, Engine.instance.currentWorld.mediaNetwork)
      Engine.instance.currentWorld.networks.delete(action.currentInstanceId)
      Engine.instance.currentWorld._mediaHostId = action.newInstanceId as UserId
      s.instances.merge({ [action.newInstanceId]: currentNetwork })
      s.instances[action.currentInstanceId].set(none)
    })
}

export const accessMediaInstanceConnectionState = () => getState(MediaInstanceState)

export const useMediaInstanceConnectionState = () => useState(accessMediaInstanceConnectionState())

//Service
export const MediaInstanceConnectionService = {
  provisionServer: async (channelId?: string, createNewRoom = false) => {
    logger.info(`Provision Media Server, channelId: "${channelId}".`)
    const token = accessAuthState().authUser.accessToken.value
    const provisionResult = await API.instance.client.service('instance-provision').find({
      query: {
        channelId,
        token,
        createNewRoom
      }
    })
    if (provisionResult.ipAddress && provisionResult.port) {
      console.log('current channels', accessChatState().channels.channels.value)
      dispatchAction(
        MediaInstanceConnectionAction.serverProvisioned({
          instanceId: provisionResult.id as UserId,
          ipAddress: provisionResult.ipAddress,
          port: provisionResult.port,
          roomCode: provisionResult.roomCode,
          channelId: channelId ? channelId : '',
          channelType: accessChatState().channels.channels.value.find((channel) => channel.id === channelId)!
            .channelType
        })
      )
    } else {
      dispatchAction(NetworkConnectionService.actions.noMediaServersAvailable({ instanceId: channelId! ?? '' }))
    }
  },
  connectToServer: async (instanceId: string, channelId: string) => {
    dispatchAction(MediaInstanceConnectionAction.serverConnecting({ instanceId }))
    const authState = accessAuthState()
    const user = authState.user.value
    const { ipAddress, port } = accessMediaInstanceConnectionState().instances.value[instanceId]

    const network = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    logger.info({ socket: !!network.socket, network }, 'Connect To Media Server.')
    if (network.socket) {
      await endVideoChat(network, { endConsumers: true })
      leaveNetwork(network, false)
    }

    const locationState = accessLocationState()
    const currentLocation = locationState.currentLocation.location

    dispatchAction(
      MediaInstanceConnectionAction.enableVideo({
        instanceId,
        enableVideo:
          currentLocation?.locationSetting?.videoEnabled?.value === true ||
          !(
            currentLocation?.locationSetting?.locationType?.value === 'showroom' &&
            user.locationAdmins?.find((locationAdmin) => locationAdmin.locationId === currentLocation?.id?.value) ==
              null
          )
      })
    )

    await network.initialize({ port, ipAddress, channelId })
  },
  resetServer: (instanceId: string) => {
    dispatchAction(MediaInstanceConnectionAction.disconnect({ instanceId }))
  },
  useAPIListeners: () => {
    useEffect(() => {
      const listener = (params) => {
        if (params.channelId != null) {
          dispatchAction(
            MediaInstanceConnectionAction.serverProvisioned({
              instanceId: params.instanceId,
              ipAddress: params.ipAddress,
              port: params.port,
              roomCode: params.roomCode,
              channelId: params.channelId,
              channelType: params.channelType
            })
          )
        }
      }
      API.instance.client.service('instance-provision').on('created', listener)
      return () => {
        API.instance.client.service('instance-provision').off('created', listener)
      }
    }, [])
  }
}

//Action
export class MediaInstanceConnectionAction {
  static serverProvisioned = defineAction({
    type: 'xre.client.MediaInstanceConnection.MEDIA_INSTANCE_SERVER_PROVISIONED' as const,
    instanceId: matchesUserId,
    ipAddress: matches.string,
    port: matches.string,
    roomCode: matches.string,
    channelType: matches.string as Validator<unknown, ChannelType>,
    channelId: matches.string
  })

  static serverConnecting = defineAction({
    type: 'xre.client.MediaInstanceConnection.MEDIA_INSTANCE_SERVER_CONNECTING' as const,
    instanceId: matches.string
  })

  static enableVideo = defineAction({
    type: 'xre.client.MediaInstanceConnection.MEDIA_INSTANCE_SERVER_VIDEO_ENABLED' as const,
    instanceId: matches.string,
    enableVideo: matches.boolean
  })

  static serverConnected = defineAction({
    type: 'xre.client.MediaInstanceConnection.MEDIA_INSTANCE_SERVER_CONNECTED' as const,
    instanceId: matches.string
  })

  static disconnect = defineAction({
    type: 'xre.client.MediaInstanceConnection.MEDIA_INSTANCE_SERVER_DISCONNECT' as const,
    instanceId: matches.string
  })

  static joiningNonInstanceMediaChannel = defineAction({
    type: 'xre.client.MediaInstanceConnection.JOINING_NON_INSTANCE_MEDIA_CHANNEL' as const
  })

  static changeActiveConnectionHostId = defineAction({
    type: 'xre.client.MediaInstanceConnection.MEDIA_INSTANCE_SERVER_CHANGE_HOST_ID' as const,
    currentInstanceId: matchesUserId,
    newInstanceId: matchesUserId
  })
}
