import { Params } from '@feathersjs/feathers/lib'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'

export class Authentication extends Service {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params: Params): Promise<any> {
    const auth = await super.find()
    const data = (auth as any).data.map((el) => {
      return {
        ...el,
        authStrategies: JSON.parse(JSON.parse(el.authStrategies)),
        local: JSON.parse(JSON.parse(el.local)),
        jwtOptions: JSON.parse(JSON.parse(el.jwtOptions)),
        bearerToken: JSON.parse(JSON.parse(el.bearerToken)),
        callback: JSON.parse(JSON.parse(el.callback)),
        oauth: {
          ...JSON.parse(JSON.parse(el.oauth)),
          defaults: JSON.parse(JSON.parse(JSON.parse(el.oauth)).defaults),
          facebook: JSON.parse(JSON.parse(JSON.parse(el.oauth)).facebook),
          github: JSON.parse(JSON.parse(JSON.parse(el.oauth)).github),
          google: JSON.parse(JSON.parse(JSON.parse(el.oauth)).google),
          linkedin: JSON.parse(JSON.parse(JSON.parse(el.oauth)).linkedin),
          twitter: JSON.parse(JSON.parse(JSON.parse(el.oauth)).twitter)
        }
      }
    })
    return {
      total: (auth as any).total,
      limit: (auth as any).limit,
      skip: (auth as any).skip,
      data
    }
  }
}
