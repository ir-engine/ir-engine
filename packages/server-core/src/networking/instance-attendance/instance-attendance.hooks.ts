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

import { hooks as schemaHooks } from '@feathersjs/schema'
import { disallow, iff, iffElse, isProvider } from 'feathers-hooks-common'

import {
  instanceAttendanceDataValidator,
  instanceAttendancePatchValidator,
  instanceAttendanceQueryValidator
} from '@ir-engine/common/src/schemas/networking/instance-attendance.schema'

import { BadRequest } from '@feathersjs/errors'
import { Paginated } from '@feathersjs/feathers'
import {
  ChannelType,
  ChannelUserType,
  channelPath,
  channelUserPath,
  instanceAttendancePath
} from '@ir-engine/common/src/schema.type.module'
import { HookContext } from '../../../declarations'
import verifyScope from '../../hooks/verify-scope'
import { InstanceAttendanceService } from './instance-attendance.class'
import {
  instanceAttendanceDataResolver,
  instanceAttendanceExternalResolver,
  instanceAttendancePatchResolver,
  instanceAttendanceQueryResolver,
  instanceAttendanceResolver
} from './instance-attendance.resolvers'

const createChannelUser = async (context: HookContext<InstanceAttendanceService>) => {
  if (!context.result || context.method !== 'create') {
    throw new BadRequest(`${context.path} service only works for data in ${context.method}`)
  }

  const { app, headers } = context

  const data = Array.isArray(context.result)
    ? context.result
    : 'data' in context.result
    ? context.result!.data
    : [context.result]

  for (const instanceAttendance of data) {
    if (instanceAttendance.isChannel) continue

    const channel = (await app.service(channelPath).find({
      query: {
        instanceId: instanceAttendance.instanceId,
        $limit: 1
      },
      headers
    })) as Paginated<ChannelType>

    /** Only a world server gets assigned a channel, since it has chat. A media server uses a channel but does not have one itself */
    if (channel.data.length > 0) {
      const existingChannelUser = (await app.service(channelUserPath).find({
        query: {
          channelId: channel.data[0].id,
          userId: instanceAttendance.userId
        },
        headers
      })) as Paginated<ChannelUserType>

      if (!existingChannelUser.total) {
        await app.service(channelUserPath).create({
          channelId: channel.data[0].id,
          userId: instanceAttendance.userId
        })
      }
    }
  }
}

/**
 * A user should only be able to read attendance for an instance they are in and that has not ended
 */
const canReadInstanceAttendance = async (context: HookContext<InstanceAttendanceService>) => {
  const { params } = context
  if (!params.query) return false
  const loggedInUserId = params.user?.id
  if (!loggedInUserId) throw new BadRequest('Must be logged in to read instance attendance')

  const validQuery =
    typeof params.query.instanceId === 'string' &&
    params.query.instanceId !== '' &&
    typeof params.query.updatedAt === 'object' &&
    typeof params.query.updatedAt?.$gt === 'string' &&
    params.query.updatedAt?.$gt !== '' &&
    params.query.ended === false

  if (!validQuery) return false

  const instanceAttendanceService = await context.app.service(instanceAttendancePath).find({
    query: {
      instanceId: params.query.instanceId,
      userId: loggedInUserId,
      ended: false
    }
  })

  return instanceAttendanceService.total > 0
}

export default {
  around: {
    all: [
      schemaHooks.resolveExternal(instanceAttendanceExternalResolver),
      schemaHooks.resolveResult(instanceAttendanceResolver)
    ]
  },

  before: {
    all: [
      schemaHooks.validateQuery(instanceAttendanceQueryValidator),
      schemaHooks.resolveQuery(instanceAttendanceQueryResolver)
    ],
    find: [iff(isProvider('external'), iffElse(canReadInstanceAttendance, [], [verifyScope('instance', 'read')]))],
    get: [iff(isProvider('external'), verifyScope('instance', 'read'))],
    create: [
      iff(isProvider('external'), verifyScope('instance', 'write')),
      schemaHooks.validateData(instanceAttendanceDataValidator),
      schemaHooks.resolveData(instanceAttendanceDataResolver)
    ],
    update: [disallow()],
    patch: [
      iff(isProvider('external'), verifyScope('instance', 'write')),
      schemaHooks.validateData(instanceAttendancePatchValidator),
      schemaHooks.resolveData(instanceAttendancePatchResolver)
    ],
    remove: [iff(isProvider('external'), verifyScope('instance', 'write'))]
  },

  after: {
    all: [],
    find: [],
    get: [],
    create: [createChannelUser],
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
