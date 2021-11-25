import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Params } from '@feathersjs/feathers'
import { Op } from 'sequelize'

/**
 * A class for Intance service
 *
 * @author Vyacheslav Solovjov
 */
export class Analytics extends Service {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params: Params): Promise<any> {
    if (params.query!.action === 'dailyUsers') {
      const limit = params.query!.$limit || 30
      const returned = {
        total: limit,
        data: [] as Array<any>
      }
      const currentDate = new Date()
      for (let i = 0; i < limit; i++) {
        const instanceAttendance = await (this.app.service('instance-attendance') as any).Model.count({
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
    } else if (params.query!.action === 'dailyNewUsers') {
      const limit = params.query!.$limit || 30
      const returned = {
        total: limit,
        data: [] as Array<any>
      }
      const currentDate = new Date()
      for (let i = 0; i < limit; i++) {
        const newUsers = await (this.app.service('user') as any).Model.count({
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
