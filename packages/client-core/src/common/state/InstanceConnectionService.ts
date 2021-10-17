import { client } from '@xrengine/client-core/src/feathers'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { accessLocationState } from '@xrengine/client-core/src/social/state/LocationState'
import { Config } from '@xrengine/common/src/config'
import { store, useDispatch } from '../../store'
import { endVideoChat, leave } from '../../transports/SocketWebRTCClientFunctions'
import { MediaStreamService } from '../../media/state/MediaStreamService'
import { accessAuthState } from '@xrengine/client-core/src/user/state/AuthState'
import { InstanceConnectionAction } from './InstanceConnectionActions'
import { accessInstanceConnectionState } from './InstanceConnectionState'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'

export const InstanceConnectionService = {
  provisionInstanceServer: async (locationId?: string, instanceId?: string, sceneId?: string) => {
    const dispatch = useDispatch()
    {
      dispatch(InstanceConnectionAction.instanceServerProvisioning())
      const token = accessAuthState().authUser.accessToken.value
      if (instanceId != null) {
        const instance = await client.service('instance').find({
          query: {
            id: instanceId,
            ended: false
          }
        })
        if (instance.total === 0) {
          instanceId = null
        }
      }
      const provisionResult = await client.service('instance-provision').find({
        query: {
          locationId: locationId,
          instanceId: instanceId,
          sceneId: sceneId,
          token: token
        }
      })
      if (provisionResult.ipAddress != null && provisionResult.port != null) {
        dispatch(
          InstanceConnectionAction.instanceServerProvisioned(provisionResult, locationId || null, sceneId || null)
        )
      } else {
        EngineEvents.instance.dispatchEvent({
          type: SocketWebRTCClientTransport.EVENTS.PROVISION_INSTANCE_NO_GAMESERVERS_AVAILABLE
        })
      }
    }
  },
  connectToInstanceServer: async (channelType: string, channelId?: string) => {
    const dispatch = useDispatch()
    {
      try {
        dispatch(InstanceConnectionAction.instanceServerConnecting())

        const authState = accessAuthState()
        const user = authState.user
        const token = authState.authUser.accessToken.value
        const instanceConnectionState = accessInstanceConnectionState().value
        const instance = instanceConnectionState.instance
        const locationId = instanceConnectionState.locationId
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
          await leave(true)
        }
        try {
          const ipAddress = instance.ipAddress
          const port = Number(instance.port)
          await Network.instance.transport.initialize(ipAddress, port, channelType === 'instance', {
            locationId: locationId,
            token: token,
            user: user.value,
            sceneId: sceneId,
            startVideo: videoActive,
            channelType: channelType,
            channelId: channelId,
            videoEnabled:
              currentLocation?.location_settings?.videoEnabled?.value === true ||
              !(
                currentLocation?.location_settings?.locationType?.value === 'showroom' &&
                user.locationAdmins?.value?.find(
                  (locationAdmin) => locationAdmin.locationId === currentLocation?.id?.value
                ) == null
              )
          })
        } catch (error) {
          console.error('Network transport could not initialize, transport is: ', Network.instance.transport)
        }

        ;(Network.instance.transport as SocketWebRTCClientTransport).left = false
        EngineEvents.instance.addEventListener(
          MediaStreams.EVENTS.TRIGGER_UPDATE_CONSUMERS,
          MediaStreamService.triggerUpdateConsumers
        )

        dispatch(InstanceConnectionAction.instanceServerConnected())
      } catch (err) {
        console.log(err)
      }
    }
  },
  resetInstanceServer: async () => {
    const dispatch = useDispatch()
    {
      dispatch(InstanceConnectionAction.instanceServerDisconnected())
    }
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('instance-provision').on('created', (params) => {
    if (params.locationId != null)
      store.dispatch(InstanceConnectionAction.instanceServerProvisioned(params, params.locationId, params.sceneId))
  })
}
