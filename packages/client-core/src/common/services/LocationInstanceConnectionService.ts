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
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { NetworkState, updateNetworkID } from '@etherealengine/engine/src/networking/NetworkState'
import { defineState, dispatchAction, getMutableState, getState, useState } from '@etherealengine/hyperflux'

import { InstanceServerProvisionResult } from '@etherealengine/common/src/interfaces/InstanceServerProvisionResult'
import { API } from '../../API'
import { connectToNetwork, leaveNetwork, SocketWebRTCClientNetwork } from '../../transports/SocketWebRTCClientFunctions'
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

export const changeActiveConnectionHostId = (currentInstanceId: UserId, newInstanceId: UserId) => {
  const s = getMutableState(LocationInstanceState)
  const currentNetworkState = s.instances[currentInstanceId].get({ noproxy: true })
  const networkState = getMutableState(NetworkState)
  const currentNework = getState(NetworkState).networks[currentInstanceId]
  updateNetworkID(currentNework as SocketWebRTCClientNetwork, newInstanceId)
  networkState.hostIds.world.set(newInstanceId as UserId)
  s.instances.merge({ [newInstanceId]: currentNetworkState })
  s.instances[currentInstanceId].set(none)
}

export const provisionLocationInstanceServer = (
  provisionResult: InstanceServerProvisionResult,
  locationId: string | null,
  sceneId: string | null
) => {
  getMutableState(NetworkState).hostIds.world.set(provisionResult.id as UserId)
  getMutableState(LocationInstanceState).instances.merge({
    [provisionResult.id]: {
      ipAddress: provisionResult.ipAddress,
      port: provisionResult.port,
      locationId,
      sceneId,
      roomCode: provisionResult.roomCode,
      provisioned: true,
      readyToConnect: true,
      connected: false,
      connecting: false
    }
  })
}

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
      provisionLocationInstanceServer(provisionResult, locationId!, sceneId!)
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
      provisionLocationInstanceServer(provisionResult, locationId!, sceneId!)
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
      provisionLocationInstanceServer(provisionResult, locationId!, sceneId!)
    } else {
      console.warn('Failed to connect to expected existing instance')
    }
  },
  connectToServer: async (instanceId: string) => {
    getMutableState(LocationInstanceState).instances[instanceId].connecting.set(true)
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
        if (params.locationId != null) {
          provisionLocationInstanceServer(params, params.locationId, params.sceneId)
        }
      }

      API.instance.client.service('instance-provision').on('created', instanceProvisionCreatedListener)

      return () => {
        API.instance.client.service('instance-provision').off('created', instanceProvisionCreatedListener)
      }
    }, [])
  }
}
