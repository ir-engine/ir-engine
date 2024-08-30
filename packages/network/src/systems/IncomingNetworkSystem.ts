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

import { ECSState } from '@ir-engine/ecs/src/ECSState'
import { defineSystem } from '@ir-engine/ecs/src/SystemFunctions'
import { SimulationSystemGroup } from '@ir-engine/ecs/src/SystemGroups'
import { defineState, getState, PeerID } from '@ir-engine/hyperflux'

import { addDataChannelHandler, DataChannelType, removeDataChannelHandler } from '../DataChannelRegistry'
import { RingBuffer } from '../functions/RingBuffer'
import { JitterBufferEntry, Network } from '../Network'
import { NetworkState } from '../NetworkState'
import { readDataPacket } from '../serialization/DataReader'

const toArrayBuffer = (buf) => {
  const ab = new ArrayBuffer(buf.length)
  const view = new Uint8Array(ab)
  for (let i = 0; i < buf.length; ++i) {
    view[i] = buf[i]
  }
  return ab
}

export const IncomingNetworkState = defineState({
  name: 'ee.core.network.IncomingNetworkState',
  initial: () => ({
    jitterBufferTaskList: [] as JitterBufferEntry[],
    jitterBufferDelay: 100,
    incomingMessageQueueUnreliableIDs: new RingBuffer<PeerID>(100),
    incomingMessageQueueUnreliable: new RingBuffer<any>(100)
  })
})

export const ecsDataChannelType = 'ee.core.ecs.dataChannel' as DataChannelType
const handleNetworkdata = (
  network: Network,
  dataChannel: DataChannelType,
  fromPeerID: PeerID,
  message: ArrayBufferLike
) => {
  const { incomingMessageQueueUnreliable, incomingMessageQueueUnreliableIDs } = getState(IncomingNetworkState)
  if (network.isHosting) {
    incomingMessageQueueUnreliable.add(toArrayBuffer(message))
    incomingMessageQueueUnreliableIDs.add(fromPeerID)
    // forward data to clients in world immediately
    // TODO: need to include the userId (or index), so consumers can validate
    network.bufferToAll(ecsDataChannelType, fromPeerID, message)
  } else {
    incomingMessageQueueUnreliable.add(message)
    incomingMessageQueueUnreliableIDs.add(fromPeerID)
  }
}

function oldestFirstComparator(a: JitterBufferEntry, b: JitterBufferEntry) {
  return b.simulationTime - a.simulationTime
}

const execute = () => {
  const ecsState = getState(ECSState)

  const { jitterBufferTaskList, jitterBufferDelay, incomingMessageQueueUnreliable, incomingMessageQueueUnreliableIDs } =
    getState(IncomingNetworkState)

  const network = NetworkState.worldNetwork
  if (!network) return

  while (incomingMessageQueueUnreliable.getBufferLength() > 0) {
    // we may need producer IDs at some point, likely for p2p netcode, for now just consume it
    incomingMessageQueueUnreliableIDs.pop()
    const packet = incomingMessageQueueUnreliable.pop()

    readDataPacket(network, packet, jitterBufferTaskList)
  }

  jitterBufferTaskList.sort(oldestFirstComparator)

  const targetFixedTime = ecsState.simulationTime + jitterBufferDelay

  for (const [index, { simulationTime, read }] of jitterBufferTaskList.slice().entries()) {
    if (simulationTime <= targetFixedTime) {
      read()
      jitterBufferTaskList.splice(index, 1)
    }
  }
}

const reactor = () => {
  useEffect(() => {
    addDataChannelHandler(ecsDataChannelType, handleNetworkdata)
    return () => {
      removeDataChannelHandler(ecsDataChannelType, handleNetworkdata)
    }
  }, [])
  return null
}

export const IncomingNetworkSystem = defineSystem({
  uuid: 'ee.engine.IncomingNetworkSystem',
  insert: { before: SimulationSystemGroup },
  execute,
  reactor
})
