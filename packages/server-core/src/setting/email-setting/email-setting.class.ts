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
    const emailSetting = await super.find()
    const data = (emailSetting as any).data.map((el) => {
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
      total: (emailSetting as any).total,
      limit: (emailSetting as any).limit,
      skip: (emailSetting as any).skip,
      data
    }
  }
}
