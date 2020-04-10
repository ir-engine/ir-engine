import { OAuthStrategy } from '@feathersjs/authentication-oauth'
import { Params } from '@feathersjs/feathers';

export default class GithubStrategy extends OAuthStrategy {
  async getEntityData (profile: any): Promise<any> {
    const baseData = await super.getEntityData(profile, null, {})

    return {
      ...baseData
    }
  }

  async getRedirect (data: any, params?: Params): Promise<string> {
    console.log('get redirect....', data, params)
    const redirectHost = process.env.GITHUB_CALLBACK_URL || ''

    if (typeof data === Error.name) {
      return redirectHost + `?error=${data.message}`
    }
    else {
      return redirectHost + `?type=github&&token=${data.accessToken}`
    }
  }
}
