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
    const auth = (await super.find()) as any
    const data = auth.data.map((el) => {
      const oauth = JSON.parse(JSON.parse(el.oauth))
      const returned = {
        ...el,
        authStrategies: JSON.parse(JSON.parse(el.authStrategies)),
        local: JSON.parse(JSON.parse(el.local)),
        jwtOptions: JSON.parse(JSON.parse(el.jwtOptions)),
        bearerToken: JSON.parse(JSON.parse(el.bearerToken)),
        callback: JSON.parse(JSON.parse(el.callback)),
        oauth: {
          ...JSON.parse(JSON.parse(el.oauth))
        }
      }
      if (oauth.defaults) returned.oauth.defaults = JSON.parse(oauth.defaults)
      if (oauth.discord) returned.oauth.discord = JSON.parse(oauth.discord)
      if (oauth.facebook) returned.oauth.facebook = JSON.parse(oauth.facebook)
      if (oauth.github) returned.oauth.github = JSON.parse(oauth.github)
      if (oauth.google) returned.oauth.google = JSON.parse(oauth.google)
      if (oauth.linkedin) returned.oauth.linkedin = JSON.parse(oauth.linkedin)
      if (oauth.twitter) returned.oauth.twitter = JSON.parse(oauth.twitter)
      return returned
    })
    return {
      total: auth.total,
      limit: auth.limit,
      skip: auth.skip,
      data
    }
  }
}
