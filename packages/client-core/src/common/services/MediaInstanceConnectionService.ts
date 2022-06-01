import { createState, useState } from '@speigg/hookstate'

import { ChannelType } from '@xrengine/common/src/interfaces/Channel'
import { InstanceServerProvisionResult } from '@xrengine/common/src/interfaces/InstanceServerProvisionResult'
import { UserId } from '@xrengine/common/src/interfaces/UserId'
import multiLogger from '@xrengine/common/src/logger'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { NetworkTypes } from '@xrengine/engine/src/networking/classes/Network'
import { dispatchAction } from '@xrengine/hyperflux'

import { client } from '../../feathers'
import { accessLocationState } from '../../social/services/LocationService'
import { store, useDispatch } from '../../store'
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
  videoEnabled: boolean
  provisioned: boolean
  connected: boolean
  readyToConnect: boolean
  connecting: boolean
}

//State
const state = createState({
  instances: {} as { [id: string]: InstanceState }
})

store.receptors.push((action: MediaLocationInstanceConnectionActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'MEDIA_INSTANCE_SERVER_PROVISIONED':
        Engine.instance.currentWorld._mediaHostId = action.instanceId as UserId
        Engine.instance.currentWorld.networks.set(
          action.instanceId,
          new SocketWebRTCClientNetwork(action.instanceId, NetworkTypes.media)
        )
        return s.instances[action.instanceId].set({
          ipAddress: action.ipAddress,
          port: action.port,
          channelType: action.channelType!,
          channelId: action.channelId!,
          videoEnabled: false,
          provisioned: true,
          readyToConnect: true,
          connected: false,
          connecting: false
        })
      case 'MEDIA_INSTANCE_SERVER_CONNECTING':
        return s.instances[action.instanceId].connecting.set(true)
      case 'MEDIA_INSTANCE_SERVER_CONNECTED':
        return s.instances[action.instanceId].merge({
          connected: true,
          connecting: false,
          readyToConnect: false
        })
      case 'MEDIA_INSTANCE_SERVER_VIDEO_ENABLED':
        return s.instances[action.instanceId].merge({
          videoEnabled: action.enableVideo
        })
      case 'MEDIA_INSTANCE_SERVER_DISCONNECT':
        return s.instances[action.instanceId].set(undefined!)
    }
  }, action.type)
})

export const accessMediaInstanceConnectionState = () => state

export const useMediaInstanceConnectionState = () => useState(state) as any as typeof state

//Service
export const MediaInstanceConnectionService = {
  provisionServer: async (channelId?: string, isWorldConnection = false) => {
    logger.info(`Provision Media Server, channelId: "${channelId}".`)
    const dispatch = useDispatch()
    const token = accessAuthState().authUser.accessToken.value
    const provisionResult = await client.service('instance-provision').find({
      query: {
        channelId: channelId,
        token: token
      }
    })
    if (provisionResult.ipAddress && provisionResult.port) {
      dispatch(
        MediaInstanceConnectionAction.serverProvisioned(
          provisionResult,
          channelId,
          isWorldConnection ? 'instance' : 'channel'
        )
      )
    } else {
      dispatchAction(NetworkConnectionService.actions.noWorldServersAvailable({ instanceId: channelId! ?? '' }))
    }
  },
  connectToServer: async (instanceId: string, channelId: string) => {
    const dispatch = useDispatch()
    dispatch(MediaInstanceConnectionAction.serverConnecting(instanceId))
    const authState = accessAuthState()
    const user = authState.user.value
    const { ipAddress, port } = accessMediaInstanceConnectionState().instances.value[instanceId]

    const network = Engine.instance.currentWorld.mediaNetwork as SocketWebRTCClientNetwork
    logger.info({ socket: !!network.socket, network }, 'Connect To Media Server.')
    if (network.socket) {
      await endVideoChat(network, { endConsumers: true })
      await leaveNetwork(network, false)
    }

    const locationState = accessLocationState()
    const currentLocation = locationState.currentLocation.location
    const sceneId = currentLocation?.sceneId?.value

    dispatch(
      MediaInstanceConnectionAction.enableVideo(
        instanceId,
        currentLocation?.locationSetting?.videoEnabled?.value === true ||
          !(
            currentLocation?.locationSetting?.locationType?.value === 'showroom' &&
            user.locationAdmins?.find((locationAdmin) => locationAdmin.locationId === currentLocation?.id?.value) ==
              null
          )
      )
    )

    await network.initialize({ sceneId, port, ipAddress, channelId })
    network.left = false
  },
  resetServer: (instanceId: string) => {
    const dispatch = useDispatch()
    dispatch(MediaInstanceConnectionAction.disconnect(instanceId))
  }
}

if (globalThis.process.env['VITE_OFFLINE_MODE'] !== 'true') {
  client.service('instance-provision').on('created', (params) => {
    if (params.channelId != null) {
      const dispatch = useDispatch()
      dispatch(MediaInstanceConnectionAction.serverProvisioned(params, params.channelId))
    }
  })
}

//Action
export const MediaInstanceConnectionAction = {
  serverProvisioned: (
    provisionResult: InstanceServerProvisionResult,
    channelId?: string,
    channelType?: ChannelType
  ) => {
    return {
      type: 'MEDIA_INSTANCE_SERVER_PROVISIONED' as const,
      instanceId: provisionResult.id,
      ipAddress: provisionResult.ipAddress,
      port: provisionResult.port,
      channelType: channelType,
      channelId: channelId
    }
  },
  serverConnecting: (instanceId: string) => {
    return {
      type: 'MEDIA_INSTANCE_SERVER_CONNECTING' as const,
      instanceId
    }
  },
  serverConnected: (instanceId: string) => {
    return {
      type: 'MEDIA_INSTANCE_SERVER_CONNECTED' as const,
      instanceId
    }
  },
  enableVideo: (instanceId: string, enableVideo: boolean) => {
    return {
      type: 'MEDIA_INSTANCE_SERVER_VIDEO_ENABLED' as const,
      instanceId,
      enableVideo
    }
  },
  disconnect: (instanceId: string) => {
    return {
      type: 'MEDIA_INSTANCE_SERVER_DISCONNECT' as const,
      instanceId
    }
  }
}

export type MediaLocationInstanceConnectionActionType = ReturnType<
  typeof MediaInstanceConnectionAction[keyof typeof MediaInstanceConnectionAction]
>
