import { Params } from '@feathersjs/feathers/lib'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'

export class EmailSetting extends Service {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params: Params): Promise<any> {
    const emailSetting = (await super.find()) as any
    const data = emailSetting.data.map((el) => {
      return {
        ...el,
        smtp: {
          ...JSON.parse(JSON.parse(el.smtp)),
          auth: JSON.parse(JSON.parse(JSON.parse(el.smtp)).auth)
        },
        subject: JSON.parse(JSON.parse(el.subject))
      }
    })

    return {
      total: emailSetting.total,
      limit: emailSetting.limit,
      skip: emailSetting.skip,
      data
    }
  }
}
