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

import { Paginated, Params } from '@feathersjs/feathers'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'
import { KnexAdapter } from '@feathersjs/knex'

import {
  AnalyticsData,
  AnalyticsPatch,
  analyticsPath,
  AnalyticsQuery,
  AnalyticsType
} from '@etherealengine/engine/src/schemas/analytics/analytics.schema'

import { Application } from '../../../declarations'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface AnalyticsParams extends KnexAdapterParams<AnalyticsQuery> {}

/**
 * A class for Analytics service
 */

export class AnalyticsService<T = AnalyticsType, ServiceParams extends Params = AnalyticsParams> extends KnexAdapter<
  AnalyticsType,
  AnalyticsData,
  AnalyticsParams,
  AnalyticsPatch
> {
  app: Application

  constructor(options: KnexAdapterOptions, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: AnalyticsParams) {
    if (params?.query!.action === 'dailyUsers') {
      const limit = params.query!.$limit || 30
      const returned: Paginated<AnalyticsType> = {
        total: limit,
        skip: 0,
        limit,
        data: []
      }
      const currentDate = new Date()
      for (let i = 0; i < limit; i++) {
        const instanceAttendance = await this.app
          .service(analyticsPath)
          .Model.countDistinct('userId AS count')
          .table('instance_attendance')
          .where('createdAt', '>', new Date(new Date().setDate(currentDate.getDate() - (i + 1))).toISOString())
          .andWhere('createdAt', '<=', new Date(new Date().setDate(currentDate.getDate() - i)).toISOString())
          .first()

        returned.data.push({
          id: '',
          count: instanceAttendance.count,
          type: '',
          createdAt: new Date(new Date().setDate(currentDate.getDate() - i)).toDateString(),
          updatedAt: new Date(new Date().setDate(currentDate.getDate() - i)).toDateString()
        })
      }
      return returned
    } else if (params?.query!.action === 'dailyNewUsers') {
      const limit = params.query!.$limit || 30
      const returned: Paginated<AnalyticsType> = {
        total: limit,
        skip: 0,
        limit,
        data: []
      }
      const currentDate = new Date()
      for (let i = 0; i < limit; i++) {
        const newUsers = await this.app
          .service(analyticsPath)
          .Model.count('id AS count')
          .table('user')
          .where('createdAt', '>', new Date(new Date().setDate(currentDate.getDate() - (i + 1))).toISOString())
          .andWhere('createdAt', '<=', new Date(new Date().setDate(currentDate.getDate() - i)).toISOString())
          .first()

        returned.data.push({
          id: '',
          count: newUsers.count,
          type: '',
          createdAt: new Date(new Date().setDate(currentDate.getDate() - i)).toDateString(),
          updatedAt: new Date(new Date().setDate(currentDate.getDate() - i)).toDateString()
        })
      }
      return returned
    } else {
      return await super._find(params)
    }
  }

  async create(data: AnalyticsData, params?: AnalyticsParams) {
    return super._create(data, params)
  }
}
