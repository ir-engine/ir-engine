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

import { hooks as schemaHooks } from '@feathersjs/schema'
import { discardQuery, iff, isProvider } from 'feathers-hooks-common'

import {
  AnalyticsType,
  analyticsDataSchema,
  analyticsPatchSchema,
  analyticsQuerySchema,
  analyticsSchema
} from '@etherealengine/engine/src/schemas/analytics/analytics.schema'
import { instanceAttendancePath } from '@etherealengine/engine/src/schemas/networking/instance-attendance.schema'
import { userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { dataValidator, queryValidator } from '@etherealengine/engine/src/schemas/validators'
import { Paginated } from '@feathersjs/feathers'
import { getValidator } from '@feathersjs/typebox'
import { Knex } from 'knex'
import { HookContext } from '../../../declarations'
import isAction from '../../hooks/is-action'
import verifyScope from '../../hooks/verify-scope'
import { AnalyticsService } from './analytics.class'
import {
  analyticsDataResolver,
  analyticsExternalResolver,
  analyticsPatchResolver,
  analyticsQueryResolver,
  analyticsResolver
} from './analytics.resolvers'

const analyticsValidator = getValidator(analyticsSchema, dataValidator)
const analyticsDataValidator = getValidator(analyticsDataSchema, dataValidator)
const analyticsPatchValidator = getValidator(analyticsPatchSchema, dataValidator)
const analyticsQueryValidator = getValidator(analyticsQuerySchema, queryValidator)

async function addDailyUsers(context: HookContext<AnalyticsService>) {
  const limit = context.params.query?.$limit || 30
  const result: Paginated<AnalyticsType> = {
    total: limit,
    skip: 0,
    limit,
    data: []
  }

  const currentDate = new Date()
  for (let day = 0; day < limit; day++) {
    const knexClient: Knex = context.app.get('knexClient')

    const instanceAttendance = await knexClient
      .countDistinct('userId AS count')
      .table(instanceAttendancePath)
      .where('createdAt', '>', new Date(new Date().setDate(currentDate.getDate() - (day + 1))).toISOString())
      .andWhere('createdAt', '<=', new Date(new Date().setDate(currentDate.getDate() - day)).toISOString())
      .first()

    result.data.push({
      id: '',
      count: instanceAttendance.count,
      type: '',
      createdAt: new Date(new Date().setDate(currentDate.getDate() - day)).toDateString(),
      updatedAt: new Date(new Date().setDate(currentDate.getDate() - day)).toDateString()
    })
  }
  context.result = result
}

async function addDailyNewUsers(context: HookContext<AnalyticsService>) {
  const limit = context.params.query?.$limit || 30
  const result: Paginated<AnalyticsType> = {
    total: limit,
    skip: 0,
    limit,
    data: []
  }
  const currentDate = new Date()
  for (let day = 0; day < limit; day++) {
    const knexClient: Knex = this.app.get('knexClient')
    const newUsers = await knexClient
      .count('id AS count')
      .table(userPath)
      .where('createdAt', '>', new Date(new Date().setDate(currentDate.getDate() - (day + 1))).toISOString())
      .andWhere('createdAt', '<=', new Date(new Date().setDate(currentDate.getDate() - day)).toISOString())
      .first()

    result.data.push({
      id: '',
      count: newUsers.count,
      type: '',
      createdAt: new Date(new Date().setDate(currentDate.getDate() - day)).toDateString(),
      updatedAt: new Date(new Date().setDate(currentDate.getDate() - day)).toDateString()
    })
  }
  context.result = result
}

export default {
  around: {
    all: [schemaHooks.resolveExternal(analyticsExternalResolver), schemaHooks.resolveResult(analyticsResolver)]
  },

  before: {
    all: [
      iff(isProvider('external'), verifyScope('admin', 'admin')),
      () => schemaHooks.validateQuery(analyticsQueryValidator),
      schemaHooks.resolveQuery(analyticsQueryResolver)
    ],
    find: [
      iff(isAction('dailyUsers'), addDailyUsers),
      iff(isAction('dailyNewUsers'), addDailyNewUsers),
      discardQuery('action')
    ],
    get: [],
    create: [() => schemaHooks.validateData(analyticsDataValidator), schemaHooks.resolveData(analyticsDataResolver)],
    update: [],
    patch: [() => schemaHooks.validateData(analyticsPatchValidator), schemaHooks.resolveData(analyticsPatchResolver)],
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
