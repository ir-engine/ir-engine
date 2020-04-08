import { OAuthStrategy, OAuthProfile } from '@feathersjs/authentication-oauth'

export default class GithubStrategy extends OAuthStrategy {
  async getEntityData (profile: OAuthProfile): Promise<any> {
    const baseData = await super.getEntityData(profile, null, {})

    console.log('github.............', baseData);
    return {
      ...baseData
    }
  }
}
