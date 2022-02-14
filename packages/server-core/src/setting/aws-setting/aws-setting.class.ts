import { Params } from '@feathersjs/feathers/lib'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'

export class Aws extends Service {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: Params): Promise<any> {
    const awsSetting = (await super.find()) as any
    const data = awsSetting.data.map((el) => {
      let keys = JSON.parse(el.keys)
      let route53 = JSON.parse(el.route53)
      let s3 = JSON.parse(el.s3)
      let cloudfront = JSON.parse(el.cloudfront)
      let sms = JSON.parse(el.sms)

      if (typeof keys === 'string') keys = JSON.parse(keys)
      if (typeof route53 === 'string') route53 = JSON.parse(route53)
      if (typeof s3 === 'string') s3 = JSON.parse(s3)
      if (typeof cloudfront === 'string') cloudfront = JSON.parse(cloudfront)
      if (typeof sms === 'string') sms = JSON.parse(sms)

      return {
        ...el,
        keys: keys,
        route53: {
          ...route53,
          keys: JSON.parse(route53.keys)
        },
        s3: s3,
        cloudfront: cloudfront,
        sms: sms
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
