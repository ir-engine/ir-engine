import { OAuthStrategy, OAuthProfile } from '@feathersjs/authentication-oauth'

export default class GithubStrategy extends OAuthStrategy {
  async getEntityData (profile: OAuthProfile) {
    const baseData = await super.getEntityData(profile, null, {})

    return {
      ...baseData
    }
  }
}
