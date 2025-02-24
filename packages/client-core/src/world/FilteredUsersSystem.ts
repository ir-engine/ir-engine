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

import { UserID } from '@ir-engine/common/src/schema.type.module'
import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { PresentationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { getNearbyUsers } from '@ir-engine/engine/src/avatar/functions/getNearbyUsers'
import { defineState, getMutableState, getState } from '@ir-engine/hyperflux'
import { NetworkState } from '@ir-engine/network'

import { useMediaNetwork } from '../common/services/MediaInstanceConnectionService'

export const FilteredUsersState = defineState({
  name: 'FilteredUsersState',
  initial: () => ({
    nearbyLayerUsers: [] as UserID[]
  })
})

export const FilteredUsersService = {
  updateNearbyLayerUsers: () => {
    if (!NetworkState.worldNetwork?.peers) return
    const mediaState = getMutableState(FilteredUsersState)
    const peers = Object.values(NetworkState.worldNetwork.peers)
    const worldUserIds = peers
      .filter((peer) => peer.peerID !== NetworkState.worldNetwork.hostPeerID && peer.userId !== Engine.instance.userID)
      .map((peer) => peer.userId)
    const nearbyUsers = getNearbyUsers(Engine.instance.userID, worldUserIds)
    mediaState.nearbyLayerUsers.set(nearbyUsers)
  }
}

export const updateNearbyAvatars = () => {
  const network = NetworkState.mediaNetwork
  if (!network) return

  FilteredUsersService.updateNearbyLayerUsers()
}

// every 5 seconds
const NEARBY_AVATAR_UPDATE_PERIOD = 5
let accumulator = 0

const execute = () => {
  accumulator += getState(ECSState).deltaSeconds
  if (accumulator > NEARBY_AVATAR_UPDATE_PERIOD) {
    accumulator = 0
    updateNearbyAvatars()
  }
}

const reactor = () => {
  const mediaNetwork = useMediaNetwork()

  useEffect(() => {
    accumulator = NEARBY_AVATAR_UPDATE_PERIOD
  }, [mediaNetwork?.peers])

  return null
}

export const FilteredUsersSystem = defineSystem({
  uuid: 'ee.client.FilteredUsersSystem',
  insert: { after: PresentationSystemGroup },
  execute,
  reactor
})
