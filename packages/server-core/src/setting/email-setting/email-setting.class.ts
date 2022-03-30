import { NullableId, Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { EmailSetting as EmailSettingInterface } from '@xrengine/common/src/interfaces/EmailSetting'

import { Application } from '../../../declarations'

export type EmailSettingDataType = EmailSettingInterface

export class EmailSetting<T = EmailSettingDataType> extends Service<T> {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(): Promise<T[] | Paginated<T>> {
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

  async patch(id: NullableId, data: any): Promise<T | T[]> {
    return super.patch(id, data)
  }
}
