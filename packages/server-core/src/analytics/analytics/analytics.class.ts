import { Paginated, Params } from '@feathersjs/feathers'
import { KnexAdapter } from '@feathersjs/knex'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'

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
