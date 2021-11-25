import { OAuthStrategy } from '@feathersjs/authentication-oauth'
import { Params } from '@feathersjs/feathers'
// import { OAuthProfile } from '@feathersjs/authentication-oauth/src/strategy'

export class CustomOAuthStrategy extends OAuthStrategy {
  async getEntityQuery(profile: any, _params: Params): Promise<any> {
    return {
      token: profile.sub ? `${this.name}:::${profile.sub as string}` : `${this.name}:::${profile.id as string}`
    }
  }

  async getEntityData(profile: any, _existingEntity: any, _params: Params): Promise<any> {
    return {
      token: profile.sub ? `${this.name}:::${profile.sub as string}` : `${this.name}:::${profile.id as string}`
    }
  }
}
export default CustomOAuthStrategy
