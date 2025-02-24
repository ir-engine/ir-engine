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

import { OAuthStrategy } from '@feathersjs/authentication-oauth'
import { Params } from '@feathersjs/feathers'

import { AuthenticationRequest, AuthenticationResult } from '@feathersjs/authentication'
import multiLogger from '@ir-engine/common/src/logger'
import { IdentityProviderType, identityProviderPath } from '@ir-engine/common/src/schema.type.module'
import { userLoginPath } from '@ir-engine/common/src/schemas/user/user-login.schema'
import { UserID } from '@ir-engine/common/src/schemas/user/user.schema'
import { Application } from '../../../declarations'
import { RedirectConfig } from '../../types/OauthStrategies'

// import { OAuthProfile } from '@feathersjs/authentication-oauth/src/strategy'
const logger = multiLogger.child({ component: 'engine:ecs:CustomOAuthParams' })

export interface CustomOAuthParams extends Params {
  redirect?: string
  access_token?: string
  refresh_token?: string
}

export class CustomOAuthStrategy extends OAuthStrategy {
  // @ts-ignore
  app: Application

  private readonly userNotFoundError = 'User not found. Please sign up first.'

  async getEntityQuery(profile: any, _params: Params): Promise<any> {
    if (!profile)
      throw new Error(
        'Something went wrong when logging you in. Please return to the page you started from and try again.'
      )
    return {
      token: profile.sub ? `${this.name}:::${profile.sub as string}` : `${this.name}:::${profile.id as string}`
    }
  }

  async getEntityData(profile: any, _existingEntity: any, _params: Params): Promise<any> {
    if (!profile)
      throw new Error(
        'Something went wrong when logging you in. Please return to the page you started from and try again.'
      )
    return {
      token: profile.sub ? `${this.name}:::${profile.sub as string}` : `${this.name}:::${profile.id as string}`
    }
  }

  // Method to create a user login entry for SSO providers
  async userLoginEntry(entity: any, params: Params): Promise<any> {
    // Create a user-login entry
    try {
      await this.app.service(userLoginPath).create({
        userId: entity.userId as UserID,
        userAgent: params.headers!['user-agent'],
        identityProviderId: entity.id,
        ipAddress: params.forwarded?.ip || ''
      })
      logger.info('User login entry created successfully.')
    } catch (error) {
      logger.error('Error creating user login entry:', error)
    }
  }

  protected async validateSignInUser(
    authentication: AuthenticationRequest,
    originalParams: Params,
    type: IdentityProviderType['type']
  ) {
    const isSignIn = originalParams.query?.action === 'signin'
    if (isSignIn && authentication?.profile) {
      const token = (await this.getEntityQuery(authentication?.profile, {})).token
      const identityProviders = await this.app.service(identityProviderPath).find({
        query: {
          token,
          type: type
        }
      })
      if (identityProviders?.data?.length === 0) {
        // User does not exist in identityProvider, throw an error
        throw new Error(this.userNotFoundError)
      }
    }
  }

  protected async handleErrorRedirect(
    data: AuthenticationResult | Error,
    params: CustomOAuthParams,
    redirectConfig: RedirectConfig,
    redirectDomain: string | undefined
  ) {
    const isSignIn = params.query?.action === 'signin'
    const errorMessage = data.message as string
    if (isSignIn && errorMessage == this.userNotFoundError) {
      return `${redirectConfig.domain}${redirectConfig.path}?userNotFound==${encodeURIComponent(errorMessage)}`
    }
    return redirectDomain + `?error=${errorMessage}`
  }
}

export default CustomOAuthStrategy
