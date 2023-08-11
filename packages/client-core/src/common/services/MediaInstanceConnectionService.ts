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

import { none } from '@hookstate/core'
import { useEffect } from 'react'

import { UserId } from '@etherealengine/common/src/interfaces/UserId'
import multiLogger from '@etherealengine/common/src/logger'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { NetworkTopics } from '@etherealengine/engine/src/networking/classes/Network'
import { addNetwork, NetworkState } from '@etherealengine/engine/src/networking/NetworkState'
import { defineState, dispatchAction, getMutableState, getState, State, useState } from '@etherealengine/hyperflux'

import { ChannelID } from '@etherealengine/common/src/interfaces/ChannelUser'
import { InstanceServerProvisionResult } from '@etherealengine/common/src/interfaces/InstanceServerProvisionResult'
import { LocationState } from '../../social/services/LocationService'
import {
  connectToNetwork,
  endVideoChat,
  initializeNetwork,
  leaveNetwork,
  SocketWebRTCClientNetwork
} from '../../transports/SocketWebRTCClientFunctions'
import { AuthState } from '../../user/services/AuthService'
import { NetworkConnectionService } from './NetworkConnectionService'

const logger = multiLogger.child({ component: 'client-core:service:media-instance' })

type InstanceState = {
  ipAddress: string
  port: string
  channelId?: ChannelID
  roomCode: string
  videoEnabled: boolean
  provisioned: boolean
  connected: boolean
  readyToConnect: boolean
  connecting: boolean
}

export const MediaInstanceState = defineState({
  name: 'MediaInstanceState',
  initial: () => ({
    instances: {} as { [id: string]: InstanceState },
    /** @deprecated */
    joiningNewMediaChannel: false
  })
})

export function useMediaNetwork() {
  const mediaNetworkState = useState(getMutableState(NetworkState).networks)
  const mediaHostId = useState(getMutableState(NetworkState).hostIds.media)
  return mediaHostId.value ? (mediaNetworkState[mediaHostId.value] as State<SocketWebRTCClientNetwork>) : null
}

export function useMediaInstance() {
  const mediaInstanceState = useState(getMutableState(MediaInstanceState).instances)
  const mediaHostId = useState(getMutableState(NetworkState).hostIds.media)
  return mediaHostId.value ? mediaInstanceState[mediaHostId.value] : null
}

export const MediaInstanceConnectionService = {
  provision: (provisionResult: InstanceServerProvisionResult, channelId?: ChannelID) => {
    getMutableState(NetworkState).hostIds.media.set(provisionResult.id as UserId)
    const existingNetwork = getState(NetworkState).networks[provisionResult.id]
    if (!existingNetwork) {
      addNetwork(initializeNetwork(provisionResult.id as UserId, NetworkTopics.media))
      getMutableState(MediaInstanceState).instances[provisionResult.id].set({
        ipAddress: provisionResult.id,
        port: provisionResult.port,
        channelId: channelId,
        roomCode: provisionResult.roomCode,
        videoEnabled: false,
        provisioned: true,
        readyToConnect: true,
        connected: false,
        connecting: false
      })
    }
  },
  provisionServer: async (channelId?: ChannelID, createPrivateRoom = false) => {
    logger.info(`Provision Media Server, channelId: "${channelId}".`)
    const token = getState(AuthState).authUser.accessToken
    const provisionResult = await Engine.instance.api.service('instance-provision').find({
      query: {
        channelId,
        token,
        createPrivateRoom
      }
    })
    if (provisionResult.ipAddress && provisionResult.port) {
      MediaInstanceConnectionService.provision(provisionResult, channelId)
    } else {
      dispatchAction(NetworkConnectionService.actions.noMediaServersAvailable({ instanceId: channelId! ?? '' }))
    }
  },
  connectToServer: async (instanceId: string, channelId: ChannelID) => {
    const mediaInstanceState = getMutableState(MediaInstanceState)
    mediaInstanceState.instances[instanceId].connecting.set(true)
    const authState = getState(AuthState)
    const user = authState.user
    const { ipAddress, port } = mediaInstanceState.instances[instanceId]

    const network = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
    logger.info({ primus: !!network.primus, network }, 'Connect To Media Server.')
    if (network.primus) {
      await endVideoChat(network, { endConsumers: true })
      await leaveNetwork(network, false)
    }

    const locationState = getState(LocationState)
    const currentLocation = locationState.currentLocation.location
    mediaInstanceState.instances[instanceId].merge({
      videoEnabled:
        currentLocation?.locationSetting?.videoEnabled === true ||
        !(
          currentLocation?.locationSetting?.locationType === 'showroom' &&
          user.locationAdmins?.find((locationAdmin) => locationAdmin.locationId === currentLocation?.id) == null
        )
    })

    await connectToNetwork(network, { port: port.value, ipAddress: ipAddress.value, channelId })
  },
  setServerConnected: (instanceId: string) => {
    const mediaInstanceState = getMutableState(MediaInstanceState)
    mediaInstanceState.joiningNewMediaChannel.set(false)
    mediaInstanceState.instances[instanceId].merge({
      connected: true,
      connecting: false,
      readyToConnect: false
    })
  },
  resetServer: (instanceId: string) => {
    getMutableState(MediaInstanceState).instances[instanceId].set(none)
  },
  setJoining: (joining: boolean) => {
    getMutableState(MediaInstanceState).joiningNewMediaChannel.set(true)
  },
  useAPIListeners: () => {
    useEffect(() => {
      const listener = (params) => {
        if (params.channelId != null) {
          MediaInstanceConnectionService.provision(params, params.channelId)
        }
      }
      Engine.instance.api.service('instance-provision').on('created', listener)
      return () => {
        Engine.instance.api.service('instance-provision').off('created', listener)
      }
    }, [])
  }
}
