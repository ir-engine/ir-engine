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

import { BadRequest } from '@feathersjs/errors'
import { Params } from '@feathersjs/feathers'
import {
  InstanceAttendanceData,
  InstanceID,
  instanceAttendancePath,
  instancePath,
  instanceSignalingPath,
  locationPath
} from '@ir-engine/common/src/schema.type.module'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { getState, PeerID } from '@ir-engine/hyperflux'
import { Application } from '../../../declarations'
import { ServerMode, ServerState } from '../../ServerState'

type InstanceSignalingDataType = {
  instanceID: InstanceID
}

// placeholder
type OfferRequest = {
  type: 'offer'
  data: object
}

type AnswerRequest = {
  type: 'answer'
  data: object
}

type SignalData = {
  instanceID: InstanceID
  targetPeerID: PeerID
  fromPeerID: PeerID
  message: OfferRequest | AnswerRequest
}

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [instanceSignalingPath]: {
      create: (data: InstanceSignalingDataType, params?: Params) => Promise<void>
      get: (data: InstanceSignalingDataType, params?: Params) => Promise<void>
      patch: (id: null, data: Omit<SignalData, 'fromPeerID'>, params?: Params) => Promise<InstanceSignalingDataType>
    }
  }
}

const peerJoin = async (app: Application, data: InstanceSignalingDataType, params: Params) => {
  console.log('peerJoin', data, params)
  const peerID = params.socketQuery!.peerID

  const user = params.user
  if (!user) throw new BadRequest('Must be logged in to join instance')

  if (!peerID) throw new BadRequest('PeerID required')

  if (!data?.instanceID) throw new BadRequest('InstanceID required')

  const instanceID = data.instanceID as InstanceID

  app.channel(`instance/${instanceID}`).join(params.connection!)
  app.channel(`peerIds/${peerID}`).join(params.connection!)

  const instance = await app.service(instancePath).get(instanceID)

  const newInstanceAttendance: InstanceAttendanceData = {
    isChannel: !!instance.channelId,
    instanceId: instanceID,
    userId: user.id,
    peerId: peerID
  }
  if (!newInstanceAttendance.isChannel) {
    const location = await app.service(locationPath).get(instance.locationId!, { headers: params.headers })
    newInstanceAttendance.sceneId = location.sceneId
  }

  await app.service(instanceAttendancePath).create(newInstanceAttendance)
}

export default (app: Application): void => {
  app.use(instanceSignalingPath, {
    /** Notify server peer has joined */
    create: async (data, params) => peerJoin(app, data, params!),
    /** Heartbeat */
    get: async (data: InstanceSignalingDataType, params) => {
      const peerID = params!.socketQuery!.peerID
      const instanceId = data.instanceID
      if (!peerID || !instanceId) throw new BadRequest('instanceID required')

      const now = await getDateTimeSql()
      await app.service(instanceAttendancePath).patch(
        null,
        {
          updatedAt: now
        },
        {
          query: {
            peerId: peerID,
            instanceId
          }
        }
      )
    },
    /** Send requests to other peers */
    patch: async (id: null, data: SignalData, params) => {
      const peerID = params!.socketQuery!.peerID
      const instanceId = data.instanceID
      const targetPeerID = data.targetPeerID

      if (!peerID || !instanceId) throw new BadRequest('instanceID required')

      const instanceAttendance = await app.service(instanceAttendancePath).find({
        query: {
          instanceId,
          peerId: peerID
        }
      })

      if (!instanceAttendance.data.length) throw new BadRequest('Peer not in instance')

      const instance = await app.service(instancePath).get(instanceId)
      if (!instance.currentUsers) throw new BadRequest('Instance not active')

      const targetInstanceAttendance = await app.service(instanceAttendancePath).find({
        query: {
          instanceId,
          peerId: targetPeerID
        }
      })
      if (!targetInstanceAttendance.data.length) throw new BadRequest('Target peer not in instance')

      // from here, we can leverage feathers-sync to send the message to the target peer
      data.fromPeerID = peerID
      return data
    }
  })

  const service = app.service(instanceSignalingPath)
  // service.hooks(hooks)

  if (getState(ServerState).serverMode !== ServerMode.API) return

  app.on('disconnect', async (connection) => {
    console.log('disconnect', connection)
    const peerID = connection.socketQuery.peerID
    if (!peerID) return

    const instanceAttendance = await app.service(instanceAttendancePath).patch(
      null,
      {
        ended: true
      },
      {
        query: {
          peerId: peerID
        }
      }
    )
    if (!instanceAttendance?.length) return

    app.channel(`instance/${instanceAttendance[0].instanceId}`).leave(connection)
    app.channel(`peerIds/${peerID}`).leave(connection)
  })

  app.service(instanceAttendancePath).publish('patched', async (data, context) => {
    // assume only one instanceAttendance is patched at a time
    const [instanceAttendance] = Array.isArray(data) ? data : 'data' in data ? data.data : [data]
    if (!instanceAttendance.ended) return

    const instance = await app.service(instancePath).get(instanceAttendance.instanceId)
    if (instance.currentUsers === 0) {
      await app.service(instancePath).patch(instanceAttendance.instanceId, {
        ended: true
      })
    }

    return app.channel(`instance/${instanceAttendance.instanceId}`).send([instanceAttendance])
  })

  app.service(instanceAttendancePath).publish('created', async (data, context) => {
    // assume only one instanceAttendance is patched at a time
    const [instanceAttendance] = Array.isArray(data) ? data : 'data' in data ? data.data : [data]

    return app.channel(`instance/${instanceAttendance.instanceId}`).send([instanceAttendance])
  })

  app.service(instanceSignalingPath).publish('patched', async (data: SignalData, context) => {
    return app.channel(`peerIds/${data.targetPeerID}`).send(data)
  })
}
