import { OAuthStrategy } from '@feathersjs/authentication-oauth'
import { Params } from '@feathersjs/feathers'

import { Application } from '../../../declarations'

// import { OAuthProfile } from '@feathersjs/authentication-oauth/src/strategy'

export class CustomOAuthStrategy extends OAuthStrategy {
  // @ts-ignore
  app: Application
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
