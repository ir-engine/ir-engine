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

import { PeersUpdateType } from '@etherealengine/common/src/interfaces/PeerID'
import { dispatchAction, getState } from '@etherealengine/hyperflux'

import { defineSystem } from '../../ecs/functions/SystemFunctions'
import { NetworkActions } from '../NetworkState'
import { Network } from '../classes/Network'
import { NetworkActionFunctions } from '../functions/NetworkActionFunctions'
import { WorldState } from '../interfaces/WorldState'

/** Publish to connected peers that peer information has changed */
export const updatePeers = (network: Network) => {
  const userNames = getState(WorldState).userNames
  const peers = Object.values(network.peers).map((peer) => {
    return {
      peerID: peer.peerID,
      peerIndex: peer.peerIndex,
      userID: peer.userId,
      userIndex: peer.userIndex,
      name: userNames[peer.userId]
    }
  }) as Array<PeersUpdateType>
  dispatchAction(
    NetworkActions.updatePeers({
      peers,
      $topic: network.topic,
      $network: network.id
    })
  )
}

const execute = () => {
  NetworkActionFunctions.sendOutgoingActions()
}

export const OutgoingActionSystem = defineSystem({
  uuid: 'ee.engine.OutgoingActionSystem',
  execute
})
