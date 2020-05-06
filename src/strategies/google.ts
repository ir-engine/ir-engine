import { OAuthStrategy } from '@feathersjs/authentication-oauth'
import { Params } from '@feathersjs/feathers'

export default class Googletrategy extends OAuthStrategy {
  async getEntityData (profile: any): Promise<any> {
    const baseData = await super.getEntityData(profile, null, {})

    return {
      ...baseData,
      profilePicture: profile.picture,
      email: profile.email,
      type: 'google'
    }
  }

  async getRedirect (data: any, params?: Params): Promise<string> {
    const redirectHost = process.env.GOOGLE_CALLBACK_URL ?? ''

    if (Object.getPrototypeOf(data) === Error.prototype) {
      const err = data.message as string
      return redirectHost + `?error=${err}`
    } else {
      const token = data.accessToken as string
      return redirectHost + `?token=${token}`
    }
  }
}
