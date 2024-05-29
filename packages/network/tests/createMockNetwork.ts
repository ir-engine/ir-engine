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

import { InstanceID, UserID } from '@etherealengine/common/src/schema.type.module'
import { getMutableState, PeerID } from '@etherealengine/hyperflux'

import { NetworkPeerFunctions } from '../src/functions/NetworkPeerFunctions'
import { createNetwork, NetworkTopics } from '../src/Network'
import { addNetwork, NetworkState } from '../src/NetworkState'

export const createMockNetwork = (networkType = NetworkTopics.world) => {
  if (networkType === NetworkTopics.world) getMutableState(NetworkState).hostIds.world.set('instanceID' as InstanceID)
  else getMutableState(NetworkState).hostIds.media.set('instanceID' as InstanceID)
  const network = createNetwork('instanceID' as InstanceID, 'hostPeerID' as PeerID, networkType)
  addNetwork(network)
  NetworkPeerFunctions.createPeer(network, 'hostPeerID' as PeerID, 0, 'hostUserID' as UserID, 0)
}
