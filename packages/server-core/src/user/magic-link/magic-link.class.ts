/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import { BadRequest } from '@feathersjs/errors'
import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import * as path from 'path'
import * as pug from 'pug'

import { identityProviderPath } from '@etherealengine/engine/src/schemas/user/identity-provider.schema'
import { loginTokenPath } from '@etherealengine/engine/src/schemas/user/login-token.schema'
import { userPath } from '@etherealengine/engine/src/schemas/user/user.schema'
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import config from '../../appconfig'
import { IdentityProviderService } from '../identity-provider/identity-provider.class'

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface Data {}

// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface ServiceOptions {}

const emailAccountTemplatesPath = path.join(appRootPath.path, 'packages', 'server-core', 'email-templates', 'account')
/**
 * A method which get link
 *
 * @param type
 * @param hash hashed link
 * @returns login url
 */
export function getLink(type: string, hash: string, subscriptionId?: string): string {
  return subscriptionId != null && subscriptionId.length > 0
    ? `${config.server.url}/login/${hash}?subId=${subscriptionId}`
    : `${config.server.url}/login/${hash}`
}
export class Magiclink implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  /**
   * A function which find magic link  and display it
   *
   * @param params
   * @returns {@Array} all magic link
   */
  async find(params?: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  /**
   * A function which find specific magic link by id
   *
   * @param id of specific magic link
   * @param params
   * @returns {@Object} contains id of magic link and message
   */
  async get(id: Id, params?: Params): Promise<Data> {
    return {
      id,
      text: `A new message with ID: ${id}!`
    }
  }
  /**
   * A function which is used to update magic link
   *
   * @param id
   * @param data which will be used for updating magic link
   * @param params
   * @returns updated data
   */
  async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  /**
   * A function which is used to update magic link
   *
   * @param id
   * @param data used to update
   * @param params
   * @returns data
   */
  async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }
  /**
   * A function which is used to remove magic link
   *
   * @param id of magic link used to remove data
   * @param params
   * @returns id
   */
  async remove(id: NullableId, params?: Params): Promise<Data> {
    return { id }
  }

  /**
   * A function used to sent an email
   *
   * @param toEmail email of reciever
   * @param token generated token
   * @param type of login
   * @param identityProvider of user
   * @param subscriptionId optional subscription ID
   * @returns {@function} sent email
   */
  async sendEmail(
    toEmail: string,
    token: string,
    type: 'connection' | 'login',
    identityProvider: IdentityProviderService,
    subscriptionId?: string
  ): Promise<void> {
    const hashLink = getLink(type, token, subscriptionId ?? '')
    let subscription
    let username
    if (subscriptionId != null) {
      subscription = await this.app.service('subscription' as any).find({
        id: subscriptionId
      })

      if (subscription.total === 0) {
        throw new BadRequest('Invalid subscription')
      }

      const subscriptionUser = await this.app.service(userPath).get(subscription.data[0].userId)

      username = subscriptionUser.name
    }
    const templatePath =
      subscriptionId == null
        ? path.join(emailAccountTemplatesPath, 'magiclink-email.pug')
        : path.join(emailAccountTemplatesPath, 'magiclink-email-subscription.pug')

    const compiledHTML = pug.compileFile(templatePath)({
      logo: config.client.logo,
      title: config.client.title,
      hashLink,
      username: username
    })
    const mailSender = config.email.from
    const email = {
      from: mailSender,
      to: toEmail,
      subject: config.email.subject.login,
      html: compiledHTML
    }

    email.html = email.html.replace(/&amp;/g, '&')
    await this.app.service('email').create(email)
  }

  /**
   * A function which used to send sms
   *
   * @param mobile of receiver user
   * @param token generated token
   * @param type of login
   * @returns {@function}  send sms
   */

  async sendSms(mobile: string, token: string, type: 'connection' | 'login'): Promise<void> {
    const hashLink = getLink(type, token, '')
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
      .service('sms')
      .create(sms, null!)
      .then(() => logger.info('Sent SMS'))
      .catch((err: any) => logger.error(err, `Error sending SMS: ${err.message}`))
  }
  /**
   * A function which is used to create magic link
   *
   * @param data used create magic link
   * @param params contain user info
   * @returns creted data
   */

  async create(data: any, params?: Params): Promise<Data> {
    const identityProviderService = this.app.service(identityProviderPath)

    // check magiclink type
    let token = ''
    if (data.type === 'email') token = data.email
    else if (data.type === 'sms') token = data.mobile

    let identityProvider
    const identityProviders = (
      (await identityProviderService.find({
        query: {
          token: token,
          type: data.type
        }
      })) as any
    ).data

    if (identityProviders.length === 0) {
      identityProvider = await identityProviderService.create(
        {
          token: token,
          type: data.type,
          accountIdentifier: token,
          userId: data.userId
        },
        params
      )
    } else {
      identityProvider = identityProviders[0]
    }

    if (identityProvider) {
      const loginToken = await this.app.service(loginTokenPath).create({
        identityProviderId: identityProvider.id
      })

      if (data.type === 'email') {
        await this.sendEmail(
          data.email,
          loginToken.token,
          data.userId ? 'connection' : 'login',
          identityProvider,
          data.subscriptionId
        )
      } else if (data.type === 'sms') {
        await this.sendSms(data.mobile, loginToken.token, data.userId ? 'connection' : 'login')
      }
    }
    return data
  }
}
