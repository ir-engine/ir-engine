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
import { Forbidden } from '@feathersjs/errors'
import { HookContext } from '@feathersjs/feathers'
import { moderationPath } from '@ir-engine/common/src/schema.type.module'
import { SYNC } from 'feathers-sync'

const checkOwnership = async (context: HookContext) => {
  const { app, data, params } = context
  const { user } = params

  if (!user) {
    throw new Error('User not authenticated')
  }

  let parsedData
  try {
    parsedData = typeof data.args === 'string' ? JSON.parse(data.args) : data.args
  } catch (error) {
    throw new Error('Invalid data format')
  }

  if (!Array.isArray(parsedData)) {
    throw new Error('Data should be an array')
  }

  const moderationIds = parsedData.map((x) => x.moderationId)
  const moderation = await app.service(moderationPath).find({
    query: {
      id: { $in: moderationIds }
    }
  })

  if (moderation.data.some((x) => x.createdBy !== user.id)) {
    throw new Forbidden('You are not authorized to perform this action')
  }

  return context
}

export default {
  before: {
    all: [],
    find: [],
    get: [],
    create: [
      (context) => {
        context[SYNC] = false
        return context
      },
      checkOwnership
    ],
    update: [],
    patch: [
      (context) => {
        context[SYNC] = false
        return context
      },
      checkOwnership
    ],
    remove: []
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
