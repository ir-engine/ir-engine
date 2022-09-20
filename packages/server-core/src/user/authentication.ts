import { AuthenticationService } from '@feathersjs/authentication'
import { oauth } from '@feathersjs/authentication-oauth'

import { Application } from '../../declarations'
import DiscordStrategy from './strategies/discord'
import FacebookStrategy from './strategies/facebook'
import GithubStrategy from './strategies/github'
import GoogleStrategy from './strategies/google'
import { MyJwtStrategy } from './strategies/jwt'
import LinkedInStrategy from './strategies/linkedin'
import { MyLocalStrategy } from './strategies/local'
import TwitterStrategy from './strategies/twitter'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

export default (app: Application): void => {
  const authentication = new AuthenticationService(app as any)
  authentication.register('jwt', new MyJwtStrategy())
  authentication.register('local', new MyLocalStrategy() as any)
  authentication.register('discord', new DiscordStrategy(app) as any)
  authentication.register('google', new GoogleStrategy(app) as any)
  authentication.register('facebook', new FacebookStrategy(app) as any)
  authentication.register('github', new GithubStrategy(app) as any)
  authentication.register('linkedin', new LinkedInStrategy(app) as any)
  authentication.register('twitter', new TwitterStrategy(app) as any)

  app.use('authentication', authentication)

  // @ts-ignore
  app.configure(oauth())
}
