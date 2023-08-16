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

import multiLogger from '@etherealengine/common/src/logger'
import { matches, matchesUserId, Validator } from '@etherealengine/engine/src/common/functions/MatchesUtils'
import { Engine } from '@etherealengine/engine/src/ecs/classes/Engine'
import { NetworkTopics } from '@etherealengine/engine/src/networking/classes/Network'
import { addNetwork, NetworkState, updateNetworkID } from '@etherealengine/engine/src/networking/NetworkState'
import { UserID } from '@etherealengine/engine/src/schemas/user/user.schema'
import {
  defineAction,
  defineState,
  dispatchAction,
  getMutableState,
  getState,
  State,
  useState
} from '@etherealengine/hyperflux'

import { ChannelID } from '@etherealengine/common/src/dbmodels/Channel'
import {
  connectToNetwork,
  endVideoChat,
  initializeNetwork,
  leaveNetwork,
  SocketWebRTCClientNetwork
} from '../../transports/SocketWebRTCClientFunctions'
import { AuthState } from '../../user/services/AuthService'

const logger = multiLogger.child({ component: 'client-core:service:media-instance' })

type InstanceState = {
  ipAddress: string
  port: string
  channelId?: ChannelID
  roomCode: string
  provisioned: boolean
}

//State
export const MediaInstanceState = defineState({
  name: 'MediaInstanceState',
  initial: () => ({
    instances: {} as { [id: string]: InstanceState }
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

export const MediaInstanceConnectionServiceReceptor = (action) => {
  const s = getMutableState(MediaInstanceState)
  matches(action)
    .when(MediaInstanceConnectionAction.serverProvisioned.matches, (action) => {
      getMutableState(NetworkState).hostIds.media.set(action.instanceId)
      const existingNetwork = getState(NetworkState).networks[action.instanceId]
      if (!existingNetwork) {
        addNetwork(initializeNetwork(action.instanceId, action.instanceId, NetworkTopics.media))
        return s.instances[action.instanceId].set({
          ipAddress: action.ipAddress,
          port: action.port,
          channelId: action.channelId,
          roomCode: action.roomCode,
          provisioned: true
        })
      }
      return s
    })
    .when(MediaInstanceConnectionAction.changeActiveConnectionHostId.matches, (action) => {
      const currentNetwork = s.instances[action.currentInstanceId].get({ noproxy: true })
      const networkState = getMutableState(NetworkState)
      const currentNework = getState(NetworkState).networks[action.currentInstanceId]
      updateNetworkID(currentNework as SocketWebRTCClientNetwork, action.newInstanceId)
      networkState.hostIds.media.set(action.newInstanceId as UserID)
      s.instances.merge({ [action.newInstanceId]: currentNetwork })
      s.instances[action.currentInstanceId].set(none)
    })
}

//Service
export const MediaInstanceConnectionService = {
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
      dispatchAction(
        MediaInstanceConnectionAction.serverProvisioned({
          instanceId: provisionResult.id as UserID,
          ipAddress: provisionResult.ipAddress,
          port: provisionResult.port,
          roomCode: provisionResult.roomCode,
          channelId: channelId
        })
      )
    } else {
      logger.error('Failed to connect to expected instance')
      setTimeout(() => {
        MediaInstanceConnectionService.provisionServer(channelId, createPrivateRoom)
      }, 1000)
    }
  },
  connectToServer: (instanceId: string, channelId: ChannelID) => {
    const authState = getState(AuthState)
    const user = authState.user
    const { ipAddress, port } = getState(MediaInstanceState).instances[instanceId]

    const network = Engine.instance.mediaNetwork as SocketWebRTCClientNetwork
    logger.info({ primus: !!network.primus, network }, 'Connect To Media Server.')
    if (network.primus) {
      endVideoChat(network, { endConsumers: true })
      leaveNetwork(network, false)
    }

    connectToNetwork(network, { port, ipAddress, channelId })
  },
  useAPIListeners: () => {
    useEffect(() => {
      const listener = (params) => {
        if (params.channelId != null) {
          dispatchAction(
            MediaInstanceConnectionAction.serverProvisioned({
              instanceId: params.instanceId,
              ipAddress: params.ipAddress,
              port: params.port,
              roomCode: params.roomCode,
              channelId: params.channelId
            })
          )
        }
      }
      Engine.instance.api.service('instance-provision').on('created', listener)
      return () => {
        Engine.instance.api.service('instance-provision').off('created', listener)
      }
    }, [])
  }
}

//Action
export class MediaInstanceConnectionAction {
  static serverProvisioned = defineAction({
    type: 'ee.client.MediaInstanceConnection.MEDIA_INSTANCE_SERVER_PROVISIONED' as const,
    instanceId: matchesUserId,
    ipAddress: matches.string,
    port: matches.string,
    roomCode: matches.string,
    channelId: matches.string.optional() as Validator<unknown, ChannelID | undefined>
  })

  static changeActiveConnectionHostId = defineAction({
    type: 'ee.client.MediaInstanceConnection.MEDIA_INSTANCE_SERVER_CHANGE_HOST_ID' as const,
    currentInstanceId: matchesUserId,
    newInstanceId: matchesUserId
  })
}
