import { Paginated } from '@feathersjs/feathers'
import { none } from '@hookstate/core'
import { useEffect } from 'react'

import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import logger from '@etherealengine/common/src/logger'
import { matches, matchesUserId, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { NetworkTopics } from '@etherealengine/engine/src/networking/classes/Network'
import {
  addNetwork,
  NetworkState,
  removeNetwork,
  updateNetworkID
} from '@etherealengine/engine/src/networking/NetworkState'
import {
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  useState
} from '@etherealengine/hyperflux'

import { API } from '../../API'
import { leaveNetwork } from '../../transports/SocketWebRTCClientFunctions'
import {
  connectToNetwork,
  initializeNetwork,
  SocketWebRTCClientNetwork
} from '../../transports/SocketWebRTCClientFunctions'
import { AuthState } from '../../user/services/AuthService'
import { NetworkConnectionService } from './NetworkConnectionService'

type InstanceState = {
  ipAddress: string
  port: string
  locationId: string | null
  sceneId: string | null
  roomCode: string
  provisioned: boolean
  connected: boolean
  readyToConnect: boolean
  connecting: boolean
}

//State
export const LocationInstanceState = defineState({
  name: 'LocationInstanceState',
  initial: () => ({
    instances: {} as { [id: string]: InstanceState }
  })
})

export function useWorldInstance() {
  const worldInstanceState = useState(getMutableState(LocationInstanceState).instances)
  const worldHostId = useState(getMutableState(NetworkState).hostIds.world)
  return worldHostId.value ? worldInstanceState[worldHostId.value] : null
}

export const LocationInstanceConnectionServiceReceptor = (action) => {
  const s = getMutableState(LocationInstanceState)
  matches(action)
    .when(LocationInstanceConnectionAction.serverProvisioned.matches, (action) => {
      getMutableState(NetworkState).hostIds.world.set(action.instanceId)
      addNetwork(initializeNetwork(action.instanceId, NetworkTopics.world))
      return s.instances.merge({
        [action.instanceId]: {
          ipAddress: action.ipAddress,
          port: action.port,
          locationId: action.locationId,
          sceneId: action.sceneId,
          roomCode: action.roomCode,
          provisioned: true,
          readyToConnect: true,
          connected: false,
          connecting: false
        }
      })
    })
    .when(LocationInstanceConnectionAction.connecting.matches, (action) => {
      return s.instances[action.instanceId].connecting.set(true)
    })
    .when(LocationInstanceConnectionAction.instanceServerConnected.matches, (action) => {
      return s.instances[action.instanceId].merge({
        connected: true,
        connecting: false,
        readyToConnect: false
      })
    })
    .when(LocationInstanceConnectionAction.disconnect.matches, (action) => {
      return s.instances[action.instanceId].set(none)
    })
    .when(LocationInstanceConnectionAction.changeActiveConnectionHostId.matches, (action) => {
      const currentNetworkState = s.instances[action.currentInstanceId].get({ noproxy: true })
      const networkState = getMutableState(NetworkState)
      const currentNework = getState(NetworkState).networks[action.currentInstanceId]
      updateNetworkID(currentNework as SocketWebRTCClientNetwork, action.newInstanceId)
      networkState.hostIds.world.set(action.newInstanceId as UserId)
      s.instances.merge({ [action.newInstanceId]: currentNetworkState })
      s.instances[action.currentInstanceId].set(none)
    })
}
/**@deprecated use getMutableState directly instead */
export const accessLocationInstanceConnectionState = () => getMutableState(LocationInstanceState)
/**@deprecated use useHookstate(getMutableState(...) directly instead */
export const useLocationInstanceConnectionState = () => useState(accessLocationInstanceConnectionState())

//Service
export const LocationInstanceConnectionService = {
  provisionServer: async (
    locationId?: string,
    instanceId?: string,
    sceneId?: string,
    roomCode?: string,
    createPrivateRoom?: boolean
  ) => {
    logger.info({ locationId, instanceId, sceneId }, 'Provision World Server')
    const token = getState(AuthState).authUser.accessToken
    if (instanceId != null) {
      const instance = (await API.instance.client.service('instance').find({
        query: {
          id: instanceId,
          ended: false
        }
      })) as Paginated<Instance>
      if (instance.total === 0) {
        instanceId = null!
      }
    }
    const provisionResult = await API.instance.client.service('instance-provision').find({
      query: {
        locationId,
        instanceId,
        sceneId,
        roomCode,
        token,
        createPrivateRoom
      }
    })
    if (provisionResult.ipAddress && provisionResult.port) {
      dispatchAction(
        LocationInstanceConnectionAction.serverProvisioned({
          instanceId: provisionResult.id as UserId,
          ipAddress: provisionResult.ipAddress,
          port: provisionResult.port,
          roomCode: provisionResult.roomCode,
          locationId: locationId,
          sceneId: sceneId
        })
      )
    } else {
      dispatchAction(NetworkConnectionService.actions.noWorldServersAvailable({ instanceId: instanceId ?? '' }))
    }
  },
  provisionExistingServer: async (locationId: string, instanceId: string, sceneId: string) => {
    logger.info({ locationId, instanceId, sceneId }, 'Provision Existing World Server')
    const token = getState(AuthState).authUser.accessToken
    const instance = (await API.instance.client.service('instance').find({
      query: {
        id: instanceId,
        ended: false
      }
    })) as Paginated<Instance>
    if (instance.total === 0) {
      const parsed = new URL(window.location.href)
      const query = parsed.searchParams
      query.delete('instanceId')
      parsed.search = query.toString()
      if (typeof history.pushState !== 'undefined') {
        window.history.replaceState({}, '', parsed.toString())
      }
      return
    }
    const provisionResult = await API.instance.client.service('instance-provision').find({
      query: {
        locationId,
        instanceId,
        sceneId,
        token
      }
    })
    if (provisionResult.ipAddress && provisionResult.port) {
      dispatchAction(
        LocationInstanceConnectionAction.serverProvisioned({
          instanceId: provisionResult.id as UserId,
          ipAddress: provisionResult.ipAddress,
          port: provisionResult.port,
          roomCode: provisionResult.roomCode,
          locationId: locationId,
          sceneId: sceneId
        })
      )
    } else {
      console.warn('Failed to connect to expected existing instance')
    }
  },
  provisionExistingServerByRoomCode: async (locationId: string, roomCode: string, sceneId: string) => {
    logger.info({ locationId, roomCode, sceneId }, 'Provision Existing World Server')
    const token = getState(AuthState).authUser.accessToken
    const instance = (await API.instance.client.service('instance').find({
      query: {
        roomCode,
        ended: false
      }
    })) as Paginated<Instance>
    if (instance.total === 0) {
      const parsed = new URL(window.location.href)
      const query = parsed.searchParams
      query.delete('roomCode')
      parsed.search = query.toString()
      if (typeof history.pushState !== 'undefined') {
        window.history.replaceState({}, '', parsed.toString())
      }
      return
    }
    const provisionResult = await API.instance.client.service('instance-provision').find({
      query: {
        locationId,
        roomCode,
        instanceId: instance.data[0].id,
        sceneId,
        token
      }
    })
    if (provisionResult.ipAddress && provisionResult.port) {
      dispatchAction(
        LocationInstanceConnectionAction.serverProvisioned({
          instanceId: provisionResult.id as UserId,
          ipAddress: provisionResult.ipAddress,
          port: provisionResult.port,
          roomCode: provisionResult.roomCode,
          locationId: locationId,
          sceneId: sceneId
        })
      )
    } else {
      console.warn('Failed to connect to expected existing instance')
    }
  },
  connectToServer: async (instanceId: string) => {
    dispatchAction(LocationInstanceConnectionAction.connecting({ instanceId }))
    const network = Engine.instance.worldNetwork as SocketWebRTCClientNetwork
    logger.info({ primus: !!network.primus, transport: network }, 'Connect To World Server')
    if (network.primus) {
      leaveNetwork(network, false)
    }
    const { ipAddress, port, locationId, roomCode } = getState(LocationInstanceState).instances[instanceId]
    await connectToNetwork(network, { port, ipAddress, locationId, roomCode })
  },
  useAPIListeners: () => {
    useEffect(() => {
      const instanceProvisionCreatedListener = (params) => {
        if (params.locationId != null)
          dispatchAction(
            LocationInstanceConnectionAction.serverProvisioned({
              instanceId: params.instanceId,
              ipAddress: params.ipAddress,
              port: params.port,
              roomCode: params.roomCode,
              locationId: params.locationId,
              sceneId: params.sceneId
            })
          )
      }

      API.instance.client.service('instance-provision').on('created', instanceProvisionCreatedListener)

      return () => {
        API.instance.client.service('instance-provision').off('created', instanceProvisionCreatedListener)
      }
    }, [])
  }
}

//Action

export class LocationInstanceConnectionAction {
  static serverProvisioned = defineAction({
    type: 'ee.client.LocationInstanceConnection.LOCATION_INSTANCE_SERVER_PROVISIONED' as const,
    instanceId: matchesUserId,
    ipAddress: matches.string,
    port: matches.string,
    roomCode: matches.string,
    locationId: matches.any as Validator<unknown, string | null>,
    sceneId: matches.any as Validator<unknown, string | null>
  })

  static connecting = defineAction({
    type: 'ee.client.LocationInstanceConnection.LOCATION_INSTANCE_SERVER_CONNECTING' as const,
    instanceId: matches.string
  })

  static instanceServerConnected = defineAction({
    type: 'ee.client.LocationInstanceConnection.LOCATION_INSTANCE_SERVER_CONNECTED' as const,
    instanceId: matches.string
  })

  static disconnect = defineAction({
    type: 'ee.client.LocationInstanceConnection.LOCATION_INSTANCE_SERVER_DISCONNECT' as const,
    instanceId: matches.string
  })

  static changeActiveConnectionHostId = defineAction({
    type: 'ee.client.LocationInstanceConnection.LOCATION_INSTANCE_SERVER_CHANGE_HOST_ID' as const,
    currentInstanceId: matchesUserId,
    newInstanceId: matchesUserId
  })
}
