import { Paginated } from '@feathersjs/feathers'
import { none, State } from '@hookstate/core'
import React, { useEffect } from 'react'

import { Instance } from '@etherealengine/common/src/interfaces/Instance'
import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import logger from '@etherealengine/common/src/logger'
import { matches, matchesUserId, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { NetworkTopics } from '@etherealengine/engine/src/networking/classes/Network'
import { defineAction, defineState, dispatchAction, getState, useState } from '@etherealengine/hyperflux'

import { API } from '../../API'
import { leaveNetwork } from '../../transports/SocketWebRTCClientFunctions'
import { SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientNetwork'
import { accessAuthState } from '../../user/services/AuthService'
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
  const [state, setState] = React.useState(null as null | State<InstanceState>)
  const worldInstanceState = useState(getState(LocationInstanceState).instances)
  const worldHostId = useState(Engine.instance.currentWorld.hostIds.world)
  useEffect(() => {
    setState(worldHostId.value ? worldInstanceState[worldHostId.value] : null)
  }, [worldInstanceState, worldHostId])
  return state
}

export const LocationInstanceConnectionServiceReceptor = (action) => {
  const s = getState(LocationInstanceState)
  matches(action)
    .when(LocationInstanceConnectionAction.serverProvisioned.matches, (action) => {
      Engine.instance.currentWorld.hostIds.world.set(action.instanceId)
      Engine.instance.currentWorld.networks.set(
        action.instanceId,
        new SocketWebRTCClientNetwork(action.instanceId, NetworkTopics.world)
      )
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
      const currentNetwork = s.instances[action.currentInstanceId].get({ noproxy: true })
      Engine.instance.currentWorld.worldNetwork.hostId = action.newInstanceId as UserId
      Engine.instance.currentWorld.networks.set(action.newInstanceId, Engine.instance.currentWorld.worldNetwork)
      Engine.instance.currentWorld.networks.delete(action.currentInstanceId)
      Engine.instance.currentWorld.hostIds.world.set(action.newInstanceId as UserId)
      s.instances.merge({ [action.newInstanceId]: currentNetwork })
      s.instances[action.currentInstanceId].set(none)
    })
}

export const accessLocationInstanceConnectionState = () => getState(LocationInstanceState)

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
    const token = accessAuthState().authUser.accessToken.value
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
    const token = accessAuthState().authUser.accessToken.value
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
    const token = accessAuthState().authUser.accessToken.value
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
    const network = Engine.instance.currentWorld.worldNetwork as SocketWebRTCClientNetwork
    logger.info({ primus: !!network.primus, transport: network }, 'Connect To World Server')
    if (network.primus) {
      leaveNetwork(network, false)
    }
    const { ipAddress, port, locationId, roomCode } =
      accessLocationInstanceConnectionState().instances.value[instanceId]
    await network.initialize({ port, ipAddress, locationId, roomCode })
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
    type: 'xre.client.LocationInstanceConnection.LOCATION_INSTANCE_SERVER_PROVISIONED' as const,
    instanceId: matchesUserId,
    ipAddress: matches.string,
    port: matches.string,
    roomCode: matches.string,
    locationId: matches.any as Validator<unknown, string | null>,
    sceneId: matches.any as Validator<unknown, string | null>
  })

  static connecting = defineAction({
    type: 'xre.client.LocationInstanceConnection.LOCATION_INSTANCE_SERVER_CONNECTING' as const,
    instanceId: matches.string
  })

  static instanceServerConnected = defineAction({
    type: 'xre.client.LocationInstanceConnection.LOCATION_INSTANCE_SERVER_CONNECTED' as const,
    instanceId: matches.string
  })

  static disconnect = defineAction({
    type: 'xre.client.LocationInstanceConnection.LOCATION_INSTANCE_SERVER_DISCONNECT' as const,
    instanceId: matches.string
  })

  static changeActiveConnectionHostId = defineAction({
    type: 'xre.client.LocationInstanceConnection.LOCATION_INSTANCE_SERVER_CHANGE_HOST_ID' as const,
    currentInstanceId: matchesUserId,
    newInstanceId: matchesUserId
  })
}
