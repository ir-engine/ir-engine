/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { AuthenticationService } from '@feathersjs/authentication'
import { oauth } from '@feathersjs/authentication-oauth'

import { Application } from '../../declarations'
import authenticationDocs from './authentication.doc'
import AppleStrategy from './strategies/apple'
import DiscordStrategy from './strategies/discord'
import FacebookStrategy from './strategies/facebook'
import GithubStrategy from './strategies/github'
import GoogleStrategy from './strategies/google'
import { MyJwtStrategy } from './strategies/jwt'
import LinkedInStrategy from './strategies/linkedin'
import TwitterStrategy from './strategies/twitter'

declare module '@ir-engine/common/declarations' {
  interface ServiceTypes {
    authentication: AuthenticationService
  }
}

export default (app: Application): void => {
  const authentication = new AuthenticationService(app as any)
  authentication.register('jwt', new MyJwtStrategy())
  authentication.register('apple', new AppleStrategy(app) as any)
  authentication.register('discord', new DiscordStrategy(app) as any)
  authentication.register('google', new GoogleStrategy(app) as any)
  authentication.register('facebook', new FacebookStrategy(app) as any)
  authentication.register('github', new GithubStrategy(app) as any)
  authentication.register('linkedin', new LinkedInStrategy(app) as any)
  authentication.register('twitter', new TwitterStrategy(app) as any)

  app.use('authentication', authentication, {
    docs: authenticationDocs
  })

  // @ts-ignore
  app.configure(oauth())
}
