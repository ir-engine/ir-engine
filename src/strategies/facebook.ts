import { OAuthStrategy } from '@feathersjs/authentication-oauth'
import { Params } from '@feathersjs/feathers'

export default class FacebookStrategy extends OAuthStrategy {
  async getEntityData (profile: any, params?: Params): Promise<any> {
    const baseData = await super.getEntityData(profile, null, {})
    const userId = (params && params.query) ? params.query.userId : undefined

    return {
      ...baseData,
      email: profile.email,
      type: 'facebook',
      userId
    }
  }

  async getRedirect (data: any, params?: Params): Promise<string> {
    const redirectHost = process.env.FACEBOOK_CALLBACK_URL ?? ''

    if (Object.getPrototypeOf(data) === Error.prototype) {
      const err = data.message as string
      return redirectHost + `?error=${err}`
    } else {
      const token = data.accessToken as string
      return redirectHost + `?token=${token}`
    }
  }
}
