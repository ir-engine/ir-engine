import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import { Op } from 'sequelize'

import { AdminAnalyticsResult } from '@xrengine/common/src/interfaces/AdminAnalyticsData'

import { Application } from '../../../declarations'

export type AnalyticsDataType = AdminAnalyticsResult

/**
 * A class for Intance service
 */
export class Analytics<T = AnalyticsDataType> extends Service<T> {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: Params): Promise<T[] | Paginated<T> | any> {
    if (params?.query!.action === 'dailyUsers') {
      const limit = params.query!.$limit || 30
      const returned: AnalyticsDataType = {
        total: limit,
        data: [] as Array<any>
      }
      const currentDate = new Date()
      for (let i = 0; i < limit; i++) {
        const instanceAttendance = await this.app.service('instance-attendance').Model.count({
          where: {
            createdAt: {
              [Op.gt]: new Date().setDate(currentDate.getDate() - (i + 1)),
              [Op.lte]: new Date().setDate(currentDate.getDate() - i)
            }
          },
          distinct: true,
          col: 'userId'
        })
        returned.data.push({
          createdAt: new Date(new Date().setDate(currentDate.getDate() - i)).toDateString(),
          count: instanceAttendance
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
        const newUsers = await this.app.service('user').Model.count({
          where: {
            createdAt: {
              [Op.gt]: new Date().setDate(currentDate.getDate() - (i + 1)),
              [Op.lte]: new Date().setDate(currentDate.getDate() - i)
            }
          }
        })
        returned.data.push({
          createdAt: new Date(new Date().setDate(currentDate.getDate() - i)).toDateString(),
          count: newUsers
        })
      }
      return returned
    } else {
      return await super.find(params)
    }
  }
}
