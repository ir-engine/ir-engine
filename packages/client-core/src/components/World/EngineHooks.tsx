/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { useEffect } from 'react'

import multiLogger from '@ir-engine/common/src/logger'
import { InstanceID } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs'
import {
  addOutgoingTopicIfNecessary,
  dispatchAction,
  getMutableState,
  none,
  useHookstate,
  useMutableState
} from '@ir-engine/hyperflux'
import {
  Network,
  NetworkActions,
  NetworkState,
  NetworkTopics,
  addNetwork,
  createNetwork,
  removeNetwork
} from '@ir-engine/network'
import { loadEngineInjection } from '@ir-engine/projects/loadEngineInjection'

import { AuthState } from '../../user/services/AuthService'

const logger = multiLogger.child({ component: 'client-core:world' })

export const useEngineInjection = () => {
  const loaded = useHookstate(false)
  useEffect(() => {
    loadEngineInjection().then(() => {
      loaded.set(true)
    })
  }, [])
  return loaded.value
}

export const useNetwork = (props: { online?: boolean }) => {
  const acceptedTOS = useMutableState(AuthState).user.acceptedTOS.value

  useEffect(() => {
    getMutableState(NetworkState).config.set({
      world: !!props.online,
      media: !!props.online && acceptedTOS,
      friends: !!props.online,
      instanceID: !!props.online,
      roomID: false
    })
  }, [props.online, acceptedTOS])

  /** Offline/local world network */
  useEffect(() => {
    if (props.online) return

    const userID = Engine.instance.userID
    const peerID = Engine.instance.store.peerID
    const peerIndex = 1
    const networkID = userID as any as InstanceID

    const networkState = getMutableState(NetworkState)
    networkState.hostIds.world.set(networkID)
    addNetwork(createNetwork(networkID, peerID, NetworkTopics.world))
    addOutgoingTopicIfNecessary(NetworkTopics.world)

    NetworkState.worldNetworkState.ready.set(true)

    const network = NetworkState.worldNetwork as Network

    dispatchAction(
      NetworkActions.peerJoined({
        $network: networkID,
        $topic: network.topic,
        $to: Engine.instance.store.peerID,
        peerID,
        peerIndex,
        userID
      })
    )

    return () => {
      dispatchAction(
        NetworkActions.peerLeft({
          $network: networkID,
          $topic: network.topic,
          $to: Engine.instance.store.peerID,
          peerID,
          userID
        })
      )
      removeNetwork(network)
      networkState.hostIds.world.set(none)
    }
  }, [props.online])
}
