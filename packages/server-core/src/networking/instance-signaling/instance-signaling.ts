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
import { CREDENTIAL_OFFSET, HASH_ALGORITHM } from '@ir-engine/common/src/constants/DefaultWebRTCSettings'
import { PUBLIC_STUN_SERVERS } from '@ir-engine/common/src/constants/STUNServers'
import multiLogger from '@ir-engine/common/src/logger'
import {
  IceServerType,
  InstanceAttendanceData,
  InstanceID,
  channelPath,
  channelUserPath,
  instanceAttendancePath,
  instancePath,
  instanceServerSettingPath,
  instanceSignalingPath,
  locationPath
} from '@ir-engine/common/src/schema.type.module'
import { getDateTimeSql } from '@ir-engine/common/src/utils/datetime-sql'
import { PeerID, getState } from '@ir-engine/hyperflux'
import { MessageTypes } from '@ir-engine/network/src/webrtc/WebRTCTransportFunctions'
import crypto from 'crypto'
import { Application } from '../../../declarations'
import { ServerMode, ServerState } from '../../ServerState'
import config from '../../appconfig'

const logger = multiLogger.child({ component: 'instance-signaling' })

type InstanceSignalingDataType = {
  instanceID: InstanceID
}

type SignalData = {
  instanceID: InstanceID
  targetPeerID: PeerID
  fromPeerID: PeerID
  message: MessageTypes
}

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    [instanceSignalingPath]: {
      create: (data: InstanceSignalingDataType, params?: Params) => ReturnType<typeof peerJoin>
      get: (data: InstanceSignalingDataType, params?: Params) => Promise<void>
      patch: (id: null, data: Omit<SignalData, 'fromPeerID'>, params?: Params) => Promise<InstanceSignalingDataType>
    }
  }
}

const peerJoin = async (app: Application, data: InstanceSignalingDataType, params: Params) => {
  const peerID = params.socketQuery!.peerID

  const user = params.user
  if (!user) throw new BadRequest('Must be logged in to join instance')

  if (!peerID) throw new BadRequest('PeerID required')

  if (!data?.instanceID) throw new BadRequest('InstanceID required')

  const instanceID = data.instanceID as InstanceID

  app.channel(`instance/${instanceID}`).join(params.connection!)
  app.channel(`peerIds/${peerID}`).join(params.connection!)

  const instance = await app.service(instancePath).get(instanceID)

  if (instance.locationId) {
    const channel = await app.service(channelPath).find({ query: { instanceId: instance.id } })
    if (channel.total) {
      const existingChannelUser = await app.service(channelUserPath).find({
        query: {
          channelId: channel.data[0].id,
          userId: user.id
        },
        headers: params.headers
      })
      if (!existingChannelUser.total) {
        await app.service(channelUserPath).create({
          channelId: channel.data[0].id,
          userId: user.id
        })
      }
    } else {
      console.warn('Channel not found')
    }
  }

  logger.info(`Peer ${peerID} joined ${instance.channelId ? 'media' : 'world'} instance ${data.instanceID}`)

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

  const newInstanceAttendanceResult = await app.service(instanceAttendancePath).create(newInstanceAttendance)

  /** Get ice servers to use */
  const instanceServerSettingsResponse = await app.service(instanceServerSettingPath).find()
  const webRTCSettings = instanceServerSettingsResponse.data[0].webRTCSettings
  const iceServers: IceServerType[] = webRTCSettings.useCustomICEServers
    ? webRTCSettings.iceServers
    : config.kubernetes.enabled
    ? PUBLIC_STUN_SERVERS
    : []

  /** Duplicated from WebRTCFunctions.ts */
  if (webRTCSettings.useCustomICEServers) {
    iceServers.forEach((iceServer) => {
      if (iceServer.useTimeLimitedCredentials) {
        const timestamp = Math.floor(Date.now() / 1000) + CREDENTIAL_OFFSET
        const username = [timestamp, peerID.replaceAll('-', '')].join(':')
        const secret = iceServer.webRTCStaticAuthSecretKey || ''

        const hmac = crypto.createHmac(HASH_ALGORITHM, secret)
        hmac.setEncoding('base64')
        hmac.write(username)
        hmac.end()

        iceServer.username = username
        iceServer.credential = hmac.read()
      }
      delete iceServer.useTimeLimitedCredentials
      delete iceServer.useFixedCredentials
      delete iceServer.webRTCStaticAuthSecretKey
    })
  }

  return {
    iceServers: iceServers as RTCIceServer[],
    index: newInstanceAttendanceResult.peerIndex
  }
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

      // console.log('heartbeat', peerID, instanceId)
    },
    /** Send requests to other peers */
    patch: async (id: null, data: SignalData, params) => {
      const peerID = params!.socketQuery!.peerID
      const instanceId = data.instanceID
      const targetPeerID = data.targetPeerID

      if (!peerID) throw new BadRequest('peerID required')
      if (!targetPeerID) throw new BadRequest('targetPeerID required')
      if (!instanceId) throw new BadRequest('instanceID required')

      /** @todo see if we need to actually verify data */
      // const [instanceAttendance, instance, targetInstanceAttendance] = await Promise.all([
      //   app.service(instanceAttendancePath).find({
      //     query: {
      //       instanceId,
      //       peerId: peerID
      //     }
      //   }),
      //   app.service(instancePath).get(instanceId),
      //   app.service(instanceAttendancePath).find({
      //     query: {
      //       instanceId,
      //       peerId: targetPeerID
      //     }
      //   })
      // ])

      // if (!instanceAttendance.data.length) throw new BadRequest(`Peer ${peerID} not in instance ${instanceId}`)
      // if (!instance.currentUsers) throw new BadRequest(`Instance not active ${instanceId}`, instance.currentUsers)
      // if (!targetInstanceAttendance.data.length)
      //   throw new BadRequest(`Target peer ${targetPeerID} not in instance ${instanceId}`)

      // from here, we can leverage feathers-sync to send the message to the target peer
      data.fromPeerID = peerID
      return data
    }
  })

  const service = app.service(instanceSignalingPath)
  // service.hooks(hooks)

  if (getState(ServerState).serverMode !== ServerMode.API) return

  app.on('disconnect', async (connection) => {
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

    for (const attendance of instanceAttendance) {
      logger.info(
        `Peer ${peerID} disconnected from ${attendance.isChannel ? 'media' : 'world'} instance ${attendance.instanceId}`
      )
      app.channel(`instance/${attendance.instanceId}`).leave(connection)
    }

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
