import { Params } from '@feathersjs/feathers/lib'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'

export class EmailSetting extends Service {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: Params): Promise<any> {
    const emailSetting = (await super.find()) as any
    const data = emailSetting.data.map((el) => {
      let smtp = JSON.parse(el.smtp)
      let subject = JSON.parse(el.subject)

      if (typeof smtp === 'string') smtp = JSON.parse(smtp)
      if (typeof subject === 'string') subject = JSON.parse(subject)

      return {
        ...el,
        smtp: {
          ...smtp,
          auth: JSON.parse(smtp.auth)
        },
        subject: subject
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
