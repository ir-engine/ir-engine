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

import { API } from '@ir-engine/common'
import { RecordingAPIState } from '@ir-engine/common/src/recording/ECSRecordingSystem'
import { RecordingID, recordingResourceUploadPath } from '@ir-engine/common/src/schema.type.module'
import { Engine } from '@ir-engine/ecs/src/Engine'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { PeerID, dispatchAction, getMutableState, none } from '@ir-engine/hyperflux'
import { NetworkActions, NetworkPeer, NetworkState } from '@ir-engine/network'

import { SocketWebRTCServerNetwork } from './SocketWebRTCServerFunctions'

export const lastSeen = new Map<PeerID, number>()

export async function checkPeerHeartbeat(network: SocketWebRTCServerNetwork): Promise<void> {
  for (const [peerID, client] of Object.entries(network.peers) as [PeerID, NetworkPeer][]) {
    if (client.userId === Engine.instance.userID) continue
    if (!lastSeen.has(peerID)) lastSeen.set(peerID, Date.now())
    if (Date.now() - lastSeen.get(peerID)! > 10000) {
      if (network.transports[peerID]) network.transports[peerID]!.end!()
      dispatchAction(
        NetworkActions.peerLeft({
          $cache: true,
          $network: network.id,
          $topic: network.topic,
          peerID,
          userID: client.userId
        })
      )
    }
  }
}

const execute = () => {
  const worldNetwork = NetworkState.worldNetwork as SocketWebRTCServerNetwork
  if (worldNetwork) {
    if (worldNetwork.isHosting) checkPeerHeartbeat(worldNetwork)
  }
}

export const uploadRecordingStaticResource = async (props: {
  recordingID: RecordingID
  key: string
  body: Buffer
  mimeType: string
}) => {
  const api = API.instance

  await api.service(recordingResourceUploadPath).create({
    recordingID: props.recordingID,
    key: props.key,
    body: props.body,
    mimeType: props.mimeType
  })
}

const reactor = () => {
  useEffect(() => {
    getMutableState(RecordingAPIState).merge({ uploadRecordingChunk: uploadRecordingStaticResource })
    return () => {
      getMutableState(RecordingAPIState).merge({ uploadRecordingChunk: none })
    }
  }, [])

  return null
}

export const ServerHostNetworkSystem = defineSystem({
  uuid: 'ee.instanceserver.ServerHostNetworkSystem',
  insert: { with: SimulationSystemGroup },
  execute,
  reactor
})
