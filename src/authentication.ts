import { ServiceAddons } from '@feathersjs/feathers'
import { AuthenticationService, JWTStrategy } from '@feathersjs/authentication'
import { LocalStrategy } from '@feathersjs/authentication-local'
import { expressOauth } from '@feathersjs/authentication-oauth'

import { Application } from './declarations'
import GithubStrategy from './strategies/github'

declare module './declarations' {
  interface ServiceTypes {
    'authentication': AuthenticationService & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  const authentication = new AuthenticationService(app)

  authentication.register('jwt', new JWTStrategy())
  authentication.register('local', new LocalStrategy())
  authentication.register('github', new GithubStrategy())

  app.use('/authentication', authentication)
  app.configure(expressOauth())
}
