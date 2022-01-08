import { AuthenticationService } from '@feathersjs/authentication'
import { expressOauth } from '@feathersjs/authentication-oauth'

import { Application } from '../../declarations'
import DiscordStrategy from './strategies/discord'
import FacebookStrategy from './strategies/facebook'
import GithubStrategy from './strategies/github'
import GoogleStrategy from './strategies/google'
import { MyJwtStrategy } from './strategies/jwt'
import LinkedInStrategy from './strategies/linkedin'
import { MyLocalStrategy } from './strategies/local'
import TwitterStrategy from './strategies/twitter'

declare module '../../declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

export default (app: Application): void => {
  const authentication = new AuthenticationService(app as any)
  authentication.register('jwt', new MyJwtStrategy())
  authentication.register('local', new MyLocalStrategy())
  authentication.register('discord', new DiscordStrategy(app))
  authentication.register('google', new GoogleStrategy(app))
  authentication.register('facebook', new FacebookStrategy(app))
  authentication.register('github', new GithubStrategy(app))
  authentication.register('linkedin', new LinkedInStrategy(app))
  authentication.register('twitter', new TwitterStrategy(app))

  app.use('authentication', authentication)

  // @ts-ignore
  app.configure(expressOauth())
}
