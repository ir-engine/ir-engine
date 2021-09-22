import { client } from '@xrengine/client-core/src/feathers'
import Store from '@xrengine/client-core/src/store'
import { EngineEvents } from '@xrengine/engine/src/ecs/classes/EngineEvents'
import { Network } from '@xrengine/engine/src/networking/classes/Network'
import { MediaStreams } from '@xrengine/engine/src/networking/systems/MediaStreamSystem'
import { Config } from '@xrengine/common/src/config'
import { Dispatch } from 'redux'
import { endVideoChat, leave } from '../../transports/SocketWebRTCClientFunctions'
import { triggerUpdateConsumers } from '../mediastream/service'
import { accessAuthState } from '@xrengine/client-core/src/user/reducers/auth/AuthState'
import {
  instanceServerConnected,
  instanceServerConnecting,
  instanceServerDisconnected,
  instanceServerProvisioned,
  instanceServerProvisioning
} from './actions'
import { SocketWebRTCClientTransport } from '../../transports/SocketWebRTCClientTransport'

const store = Store.store

export function provisionInstanceServer(locationId?: string, instanceId?: string, sceneId?: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    dispatch(instanceServerProvisioning())
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
      dispatch(instanceServerProvisioned(provisionResult, locationId, sceneId))
    } else {
      EngineEvents.instance.dispatchEvent({
        type: SocketWebRTCClientTransport.EVENTS.PROVISION_INSTANCE_NO_GAMESERVERS_AVAILABLE
      })
    }
  }
}

export function connectToInstanceServer(channelType: string, channelId?: string) {
  return async (dispatch: Dispatch, getState: any): Promise<any> => {
    try {
      dispatch(instanceServerConnecting())

      const authState = accessAuthState()
      const user = authState.user
      const token = authState.authUser.accessToken.value
      const instanceConnectionState = getState().get('instanceConnection')
      const instance = instanceConnectionState.get('instance')
      const locationId = instanceConnectionState.get('locationId')
      const locationState = getState().get('locations')
      const currentLocation = locationState.get('currentLocation').get('location')
      const sceneId = currentLocation.sceneId
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
        await Network.instance.transport.initialize(
          instance.get('ipAddress'),
          instance.get('port'),
          channelType === 'instance',
          {
            locationId: locationId,
            token: token,
            user: user.value,
            sceneId: sceneId,
            startVideo: videoActive,
            channelType: channelType,
            channelId: channelId,
            videoEnabled:
              currentLocation?.locationSettings?.videoEnabled === true ||
              !(
                currentLocation?.locationSettings?.locationType === 'showroom' &&
                user.locationAdmins?.value?.find((locationAdmin) => locationAdmin.locationId === currentLocation.id) ==
                  null
              )
          }
        )
      } catch (error) {
        console.error('Network transport could not initialize, transport is: ', Network.instance.transport)
      }

      ;(Network.instance.transport as SocketWebRTCClientTransport).left = false
      EngineEvents.instance.addEventListener(MediaStreams.EVENTS.TRIGGER_UPDATE_CONSUMERS, triggerUpdateConsumers)

      dispatch(instanceServerConnected())
    } catch (err) {
      console.log(err)
    }
  }
}

export function resetInstanceServer() {
  return async (dispatch: Dispatch): Promise<any> => {
    dispatch(instanceServerDisconnected())
  }
}

if (!Config.publicRuntimeConfig.offlineMode) {
  client.service('instance-provision').on('created', (params) => {
    if (params.locationId != null) store.dispatch(instanceServerProvisioned(params, params.locationId, params.sceneId))
  })
}
