import { OAuthStrategy } from '@feathersjs/authentication-oauth'
import { Params } from '@feathersjs/feathers'
import config from '../../src/config'

export default class Googlestrategy extends OAuthStrategy {
  async getEntityData (profile: any, params?: Params): Promise<any> {
    const baseData = await super.getEntityData(profile, null, {})
    const userId = (params?.query) ? params.query.userId : undefined

    return {
      ...baseData,
      profilePicture: profile.picture,
      email: profile.email,
      type: 'google',
      userId
    }
  }

  async getRedirect (data: any, params?: Params): Promise<string> {
    const redirectHost = config.authentication.callback.google as string

    if (Object.getPrototypeOf(data) === Error.prototype) {
      const err = data.message as string
      return redirectHost + `?error=${err}`
    } else {
      const token = data.accessToken as string
      return redirectHost + `?token=${token}`
    }
  }
}
