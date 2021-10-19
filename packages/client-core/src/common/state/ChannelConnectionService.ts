import { endVideoChat, leave } from '../../transports/SocketWebRTCClientFunctions'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { accessAuthState } from '../../user/state/AuthState'
import { Config } from '@xrengine/common/src/config'
import { client } from '../../feathers'
import { store } from '../../store'
import { accessChatState } from '../../social/state/ChatState'
import { accessChannelConnectionState } from './ChannelConnectionState'
import { ChannelConnectionAction } from './ChannelConnectionActions'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'
import { accessLocationState } from '../../social/state/LocationState'
import { MediaStreamService } from '../../media/state/MediaStreamService'

export const ChannelConnectionService = {
  provisionChannelServer: async (instanceId?: string, channelId?: string) => {
    store.dispatch(ChannelConnectionAction.channelServerProvisioning())
    const token = accessAuthState().authUser.accessToken.value
    if (instanceId != null) {
      const instance = await client.service('instance').find({
        query: {
          id: instanceId,
          ended: false
        }
      })
      if (instance.total === 0) {
        instanceId = undefined
      }
    }
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
          channelType: instanceChannel && channelId === instanceChannel[0] ? 'instance' : 'channel',
          channelId: channelId,
          videoEnabled:
            currentLocation?.location_settings?.videoEnabled?.value === true ||
            !(
              currentLocation?.location_settings?.locationType?.value === 'showroom' &&
              user.locationAdmins?.find((locationAdmin) => locationAdmin.locationId === currentLocation?.id?.value) ==
                null
            ),
          isHarmonyPage: isHarmonyPage
        })
      } catch (error) {
        console.error('Network transport could not initialize, transport is: ', Network.instance.transport)
        console.log(error)
      }

      ;(Network.instance.transport as SocketWebRTCClientTransport).left = false
      EngineEvents.instance.addEventListener(
        MediaStreams.EVENTS.TRIGGER_UPDATE_CONSUMERS,
        MediaStreamService.triggerUpdateConsumers
      )

      MediaStreams.instance.channelType = instanceChannel && channelId === instanceChannel[0] ? 'instance' : 'channel'
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
