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

import { ServiceInterface } from '@feathersjs/feathers'
import { KnexAdapterParams } from '@feathersjs/knex'
import appRootPath from 'app-root-path'
import * as path from 'path'
import * as pug from 'pug'

import { emailPath } from '@ir-engine/common/src/schemas/user/email.schema'
import { identityProviderPath, IdentityProviderType } from '@ir-engine/common/src/schemas/user/identity-provider.schema'
import { loginTokenPath } from '@ir-engine/common/src/schemas/user/login-token.schema'
import { smsPath } from '@ir-engine/common/src/schemas/user/sms.schema'

import { BadRequest } from '@feathersjs/errors'
import { EMAIL_REGEX } from '@ir-engine/common/src/regex'
import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'

const emailAccountTemplatesPath = path.join(appRootPath.path, 'packages', 'server-core', 'email-templates', 'account')

export interface MagicLinkParams extends KnexAdapterParams {}

/**
 * A class for Magic Link service
 */
export class MagicLinkService implements ServiceInterface<MagicLinkParams> {
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * A function used to sent an email
   *
   * @param toEmail email of reciever
   * @param id generated login id
   * @param token generated login token
   * @param redirectUrl URL to redirect to after login
   * @returns {function} sent email
   */
  async sendEmail(toEmail: string, id: string, token: string, redirectUrl?: string): Promise<void> {
    const hashLink = `${config.server.url}/login/${id}?token=${token}${
      redirectUrl ? `&redirectUrl=${redirectUrl}` : ''
    }`

    const templatePath = path.join(emailAccountTemplatesPath, 'magiclink-email.pug')

    const compiledHTML = pug.compileFile(templatePath)({
      headerLogo: `${config.client.url}/static/Email-Template-Header.png`,
      irWhiteLogo: `${config.client.url}/static/3d-IR-White-Logo.png`,
      templateBg: `${config.client.url}/static/Email-Template-BG.png`,
      hashLink
    })

    const mailSender = config.email.from
    const email = {
      from: mailSender,
      to: toEmail,
      subject: config.email.subject.login,
      html: compiledHTML
    }

    email.html = email.html.replace(/&amp;/g, '&')
    await this.app.service(emailPath).create(email)
  }

  /**
   * A function which used to send sms
   *
   * @param mobile of receiver user
   * @param id generated login id
   * @param token generated login token
   * @param redirectUrl URL to redirect to after login
   * @returns {function}  send sms
   */

  async sendSms(mobile: string, id: string, token: string, redirectUrl?: string): Promise<void> {
    const hashLink = `${config.server.url}/login/${id}?token=${token}${
      redirectUrl ? `&redirectUrl=${redirectUrl}` : ''
    }`
    const templatePath = path.join(emailAccountTemplatesPath, 'magiclink-sms.pug')
    const compiledHTML = pug
      .compileFile(templatePath)({
        title: config.client.title,
        hashLink
      })
      .replace(/&amp;/g, '&') // Text message links can't have HTML escaped ampersands.

    const sms = {
      mobile,
      text: compiledHTML
    }

    await this.app
      .service(smsPath)
      .create(sms, null!)
      .then(() => logger.info('Sent SMS'))
      .catch((err: any) => logger.error(err, `Error sending SMS: ${err.message}`))
  }
  /**
   * A function which is used to create magic link
   *
   * @param data used create magic link
   * @param params contain user info
   * @returns created data
   */

  async create(data: any, params?: MagicLinkParams) {
    const identityProviderService = this.app.service(identityProviderPath)

    // check magiclink type
    let token = ''
    if (data.type === 'email') {
      if (!EMAIL_REGEX.test(data.email)) {
        throw new BadRequest('Invalid email', {
          email: data.email
        })
      }
      token = data.email
    } else if (data.type === 'sms') token = data.mobile

    let identityProvider: IdentityProviderType
    const identityProviders = (
      await identityProviderService.find({
        query: {
          token: token,
          type: data.type
        }
      })
    ).data

    const authResult = await (this.app.service('authentication') as any).strategies.jwt.authenticate(
      { accessToken: data.accessToken },
      {}
    )

    const identityProviderGuest = authResult[identityProviderPath]

    if (identityProviders.length === 0) {
      identityProvider = await identityProviderService.create(
        {
          token: token,
          type: data.type,
          accountIdentifier: token,
          userId: identityProviderGuest.userId,
          email: data.email
        },
        params as any
      )
    } else {
      identityProvider = identityProviders[0]
    }

    if (identityProvider) {
      await this.removePreviousLoginTokensByProvider(identityProvider.id)
      const loginToken = await this.app.service(loginTokenPath).create({
        identityProviderId: identityProvider.id
      })

      if (data.type === 'email') {
        await this.sendEmail(data.email, loginToken.id, loginToken.token, data.redirectUrl)
      } else if (data.type === 'sms') {
        await this.sendSms(data.mobile, loginToken.id, loginToken.token, data.redirectUrl)
      }
    }
    return data
  }

  private async removePreviousLoginTokensByProvider(identityProviderId: string) {
    const loginTokenService = this.app.service(loginTokenPath)
    await loginTokenService.remove(null, {
      query: {
        identityProviderId
      }
    })
  }
}
