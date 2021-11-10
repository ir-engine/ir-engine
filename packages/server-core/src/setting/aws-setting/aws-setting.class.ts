import { Params } from '@feathersjs/feathers/lib'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'

export class Aws extends Service {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params: Params): Promise<any> {
    const awsSetting = (await super.find()) as any
    const data = awsSetting.data.map((el) => {
      return {
        ...el,
        keys: JSON.parse(JSON.parse(el.keys)),
        route53: {
          ...JSON.parse(JSON.parse(el.route53)),
          keys: JSON.parse(JSON.parse(JSON.parse(el.route53)).keys)
        },
        s3: JSON.parse(JSON.parse(el.s3)),
        cloudfront: JSON.parse(JSON.parse(el.cloudfront)),
        sms: JSON.parse(JSON.parse(el.sms))
      }
    })

    return {
      total: awsSetting.total,
      limit: awsSetting.limit,
      skip: awsSetting.skip,
      data
    }
  }
}
