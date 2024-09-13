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
  locationPath
} from '@ir-engine/common/src/schema.type.module'
import { disallow } from 'feathers-hooks-common'
import { HookContext } from '../../../declarations'
import { InstanceSignalingService } from './instance-signaling.class'

const peerJoin = async (context: HookContext<InstanceSignalingService>) => {
  const params = context.params as Params
  const peerID = params.socketQuery!.peerID

  const user = params.user
  if (!user) throw new BadRequest('Must be logged in to join instance')

  if (!peerID) throw new BadRequest('PeerID required')

  if (!context.data?.instanceID) throw new BadRequest('InstanceID required')

  const instanceID = context.data.instanceID as InstanceID

  context.app.channel(`instance/${instanceID}`).join(context.params.connection)

  const instance = await context.app.service(instancePath).get(instanceID)

  const newInstanceAttendance: InstanceAttendanceData = {
    isChannel: !!instance.channelId,
    instanceId: instanceID,
    userId: user.id,
    peerId: peerID
  }
  if (!newInstanceAttendance.isChannel) {
    const location = await context.app
      .service(locationPath)
      .get(instance.locationId!, { headers: context.params.headers })
    newInstanceAttendance.sceneId = location.sceneId
  }

  await context.app.service(instanceAttendancePath).create(newInstanceAttendance)
}

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [peerJoin],
    update: [disallow()],
    patch: [disallow()],
    remove: [disallow()]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  },

  error: {
    all: [],
    find: [],
    get: [],
    create: [],
    update: [],
    patch: [],
    remove: []
  }
} as any
