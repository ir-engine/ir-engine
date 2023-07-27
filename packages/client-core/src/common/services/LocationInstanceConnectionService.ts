/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { Paginated } from '@feathersjs/feathers'
import { none, State } from '@hookstate/core'
import { useEffect } from 'react'

import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import logger from '@etherealengine/common/src/logger'
import { matches, matchesUserId, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { NetworkTopics } from '@etherealengine/engine/src/networking/classes/Network'
import { addNetwork, NetworkState, updateNetworkID } from '@etherealengine/engine/src/networking/NetworkState'
import {
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  useState
} from '@etherealengine/hyperflux'

import { API } from '../../API'
import {
  connectToNetwork,
  initializeNetwork,
  leaveNetwork,
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

export function useWorldNetwork() {
  const worldNetworkState = useState(getMutableState(NetworkState).networks)
  const worldHostId = useState(getMutableState(NetworkState).hostIds.world)
  return worldHostId.value ? (worldNetworkState[worldHostId.value] as State<SocketWebRTCClientNetwork>) : null
}

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
      await leaveNetwork(network, false)
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
