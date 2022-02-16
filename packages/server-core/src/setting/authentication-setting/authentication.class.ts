import { Params } from '@feathersjs/feathers/lib'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'

export class Authentication extends Service {
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params?: Params): Promise<any> {
    const auth = (await super.find()) as any
    const loggedInUser = extractLoggedInUserFromParams(params)
    const data = auth.data.map((el) => {
      if (loggedInUser.userRole !== 'admin')
        return {
          id: el.id,
          entity: el.entity,
          service: el.service,
          authStrategies: JSON.parse(JSON.parse(el.authStrategies))
        }
      let oauth = JSON.parse(el.oauth)
      let authStrategies = JSON.parse(el.authStrategies)
      let local = JSON.parse(el.local)
      let jwtOptions = JSON.parse(el.jwtOptions)
      let bearerToken = JSON.parse(el.bearerToken)
      let callback = JSON.parse(el.callback)

      if (typeof oauth === 'string') oauth = JSON.parse(oauth)
      if (typeof authStrategies === 'string') authStrategies = JSON.parse(authStrategies)
      if (typeof local === 'string') local = JSON.parse(local)
      if (typeof jwtOptions === 'string') jwtOptions = JSON.parse(jwtOptions)
      if (typeof bearerToken === 'string') bearerToken = JSON.parse(bearerToken)
      if (typeof callback === 'string') callback = JSON.parse(callback)

      const returned = {
        ...el,
        authStrategies: authStrategies,
        local: local,
        jwtOptions: jwtOptions,
        bearerToken: bearerToken,
        callback: callback,
        oauth: {
          ...oauth
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
