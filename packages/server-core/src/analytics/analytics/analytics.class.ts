import { Params } from '@feathersjs/feathers'
import { KnexAdapter } from '@feathersjs/knex'
import type { KnexAdapterOptions, KnexAdapterParams } from '@feathersjs/knex'

import { AdminAnalyticsResult } from '@etherealengine/common/src/interfaces/AdminAnalyticsData'

import { Application } from '../../../declarations'
import type { AnalyticsData, AnalyticsPatch, AnalyticsQuery, AnalyticsType } from './analytics.schema'

export type AnalyticsDataType = AdminAnalyticsResult

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
      const returned: AnalyticsDataType = {
        total: limit,
        data: [] as Array<any>
      }
      const currentDate = new Date()
      for (let i = 0; i < limit; i++) {
        const instanceAttendance = await this.app
          .service('analytics')
          .Model.countDistinct('userId AS count')
          .table('instance_attendance')
          .where('createdAt', '>', new Date(new Date().setDate(currentDate.getDate() - (i + 1))).toISOString())
          .andWhere('createdAt', '<=', new Date(new Date().setDate(currentDate.getDate() - i)).toISOString())
          .first()

        returned.data.push({
          createdAt: new Date(new Date().setDate(currentDate.getDate() - i)).toDateString(),
          count: instanceAttendance.count
        })
      }
      return returned
    } else if (params?.query!.action === 'dailyNewUsers') {
      const limit = params.query!.$limit || 30
      const returned = {
        total: limit,
        data: [] as Array<any>
      }
      const currentDate = new Date()
      for (let i = 0; i < limit; i++) {
        const newUsers = await this.app
          .service('analytics')
          .Model.count('id AS count')
          .table('user')
          .where('createdAt', '>', new Date(new Date().setDate(currentDate.getDate() - (i + 1))).toISOString())
          .andWhere('createdAt', '<=', new Date(new Date().setDate(currentDate.getDate() - i)).toISOString())
          .first()
        returned.data.push({
          createdAt: new Date(new Date().setDate(currentDate.getDate() - i)).toDateString(),
          count: newUsers.count
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
