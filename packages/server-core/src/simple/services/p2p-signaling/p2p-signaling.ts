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

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2025
Infinite Reality Engine. All Rights Reserved.
*/

import { BadRequest } from '@feathersjs/errors'
import { Application, Params } from '@feathersjs/feathers'
import { InstanceID, instanceSignalingPath } from '@ir-engine/common/src/schema.type.module'
import { MessageTypes, PeerID, UserID } from '@ir-engine/hyperflux'

let peerIndex = 0

type PeerInfo = {
  peerID: PeerID
  peerIndex: number
  userID: UserID
}

// since we don't have a database, we'll store the peers in memory
const peers = {} as Record<InstanceID, PeerInfo[]>

type JoinSignalingDataType = {
  instanceID: InstanceID
}

type SignalData = {
  instanceID: InstanceID
  targetPeerID: PeerID
  fromPeerID: PeerID
  message: MessageTypes
}

const peerJoin = async (app: Application, data: JoinSignalingDataType, params: Params) => {
  const peerID = params.socketQuery!.peerID
  /**
   * @todo a simple user service to persist userids across refreshes - not secure
   */
  // @ts-ignore
  const userID = params.socketQuery!.userID

  if (!peerID) throw new BadRequest('PeerID required')

  if (!data?.instanceID) throw new BadRequest('instanceID required')

  app.channel(`peerIds/${peerID}`).join(params.connection!)

  const newPeerIndex = peerIndex++

  if (!peers[data.instanceID]) peers[data.instanceID] = [] as PeerInfo[]
  peers[data.instanceID].push({
    peerID,
    peerIndex: newPeerIndex,
    /** @todo - figure out user service somehow */
    userID
  })

  console.info(`Peer ${peerID} joined instance ${data.instanceID}`)

  return {
    index: newPeerIndex,
    iceServers: null! // todo
  }
}

export default function (app: Application) {
  app.use(instanceSignalingPath, {
    // get is heartbeat
    find: async (params?: Params) => {
      const instanceID = params?.query?.instanceID as InstanceID
      if (!instanceID) return [] as PeerInfo[]
      return peers[instanceID] || ([] as PeerInfo[])
    },
    get: async () => {},
    create: async (data: JoinSignalingDataType, params) => peerJoin(app, data, params!),
    patch: async (id: null, data: SignalData, params) => {
      const peerID = params!.socketQuery!.peerID
      const instanceID = data.instanceID
      const targetPeerID = data.targetPeerID

      if (!peerID) throw new BadRequest('peerID required')
      if (!targetPeerID) throw new BadRequest('targetPeerID required')
      if (!instanceID) throw new BadRequest('instanceID required')

      // from here, we can leverage feathers-sync to send the message to the target peer
      data.fromPeerID = peerID
      return data
    }
  })

  app.service(instanceSignalingPath)

  app.on('disconnect', async (connection) => {
    const peerID = connection.socketQuery.peerID
    if (!peerID) return
    app.channel(`peerIds/${peerID}`).leave(connection)
    for (const instanceID in peers) {
      const peerIndex = peers[instanceID].findIndex((peer) => peer.peerID === peerID)
      if (peerIndex !== -1) {
        peers[instanceID].splice(peerIndex, 1)
        console.info(`Peer ${peerID} left instance ${instanceID}`)
      }
      if (peers[instanceID].length === 0) delete peers[instanceID]
    }
  })

  app.service(instanceSignalingPath).publish('patched', async (data: SignalData, context) => {
    return app.channel(`peerIds/${data.targetPeerID}`).send(data)
  })
}
