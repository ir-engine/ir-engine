import { createState, useState } from '@speigg/hookstate'

import { ChannelType } from '@xrengine/common/src/interfaces/Channel'
import { InstanceServerProvisionResult } from '@xrengine/common/src/interfaces/InstanceServerProvisionResult'
import { Engine } from '@xrengine/engine/src/ecs/classes/Engine'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { dispatchAction } from '@xrengine/hyperflux'

import { client } from '../../feathers'
import { accessLocationState } from '../../social/services/LocationService'
import { store, useDispatch } from '../../store'
import { endVideoChat, leave } from '../../transports/SocketWebRTCClientFunctions'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { accessAuthState } from '../../user/services/AuthService'

type InstanceState = {
  ipAddress: string
  port: string
  channelType: ChannelType
  channelId: string
  videoEnabled: boolean
  provisioned: boolean
  connected: boolean
  readyToConnect: boolean
  updateNeeded: boolean
  connecting: boolean
}

//State
const state = createState({
  instances: {} as { [id: string]: InstanceState },
  currentInstanceId: null as string | null
})

store.receptors.push((action: MediaLocationInstanceConnectionActionType): any => {
  state.batch((s) => {
    switch (action.type) {
      case 'MEDIA_INSTANCE_SERVER_PROVISIONED':
        s.currentInstanceId.set(action.instanceId)
        return s.instances[action.instanceId].set({
          ipAddress: action.ipAddress,
          port: action.port,
          channelType: action.channelType!,
          channelId: action.channelId!,
          videoEnabled: false,
          provisioned: true,
          readyToConnect: true,
          updateNeeded: true,
          connected: false,
          connecting: false
        })
      case 'MEDIA_INSTANCE_SERVER_CONNECTING':
        return s.instances[action.instanceId].connecting.set(true)
      case 'MEDIA_INSTANCE_SERVER_CONNECTED':
        return s.instances[action.instanceId].merge({
          connected: true,
          connecting: false,
          updateNeeded: false,
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
    console.log('Provision Media Server', channelId)
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
        MediaLocationInstanceConnectionAction.serverProvisioned(
          provisionResult,
          channelId,
          isWorldConnection ? 'instance' : 'channel'
        )
      )
    } else {
      dispatchAction(
        Engine.instance.store,
        SocketWebRTCClientTransport.actions.noWorldServersAvailable({ instanceId: channelId! })
      )
    }
  },
  connectToServer: async (instanceId: string, channelId: string) => {
    const dispatch = useDispatch()
    dispatch(MediaLocationInstanceConnectionAction.serverConnecting(instanceId))
    const authState = accessAuthState()
    const user = authState.user.value
    const { ipAddress, port } = accessMediaInstanceConnectionState().instances.value[instanceId]

    const transport = Network.instance.getTransport('media') as SocketWebRTCClientTransport
    console.log('Connect To Media Server', !!transport.socket, transport)
    if (transport.socket) {
      await endVideoChat(transport, { endConsumers: true })
      await leave(transport, false)
    }

    const locationState = accessLocationState()
    const currentLocation = locationState.currentLocation.location
    const sceneId = currentLocation?.sceneId?.value

    dispatch(
      MediaLocationInstanceConnectionAction.enableVideo(
        instanceId,
        currentLocation?.locationSetting?.videoEnabled?.value === true ||
          !(
            currentLocation?.locationSetting?.locationType?.value === 'showroom' &&
            user.locationAdmins?.find((locationAdmin) => locationAdmin.locationId === currentLocation?.id?.value) ==
              null
          )
      )
    )

    await transport.initialize({ sceneId, port, ipAddress, instanceId, channelId })
    transport.left = false
  },
  resetServer: (instanceId: string) => {
    const dispatch = useDispatch()
    dispatch(MediaLocationInstanceConnectionAction.disconnect(instanceId))
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
  typeof MediaLocationInstanceConnectionAction[keyof typeof MediaLocationInstanceConnectionAction]
>
