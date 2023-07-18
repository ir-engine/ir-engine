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
import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import * as path from 'path'
import * as pug from 'pug'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import Paginated from '../../types/PageObject'
import { getLink, sendEmail, sendSms } from '../auth-management/auth-management.utils'
import { IdentityProvider } from '../identity-provider/identity-provider.class'

interface Data {}

interface ServiceOptions {}

const emailAccountTemplatesPath = path.join(appRootPath.path, 'packages', 'server-core', 'email-templates', 'account')
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
    identityProvider: IdentityProvider,
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

      const subscriptionUser = await this.app.service('user').get(subscription.data[0].userId)

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

    return await sendEmail(this.app, email)
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
    return await sendSms(this.app, sms)
  }
  /**
   * A function which is used to create magic link
   *
   * @param data used create magic link
   * @param params contain user info
   * @returns creted data
   */

  async create(data: any, params?: Params): Promise<Data> {
    const identityProviderService = this.app.service('identity-provider')

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
          accountIdentifier: token
        },
        params
      )
    } else {
      identityProvider = identityProviders[0]
    }

    if (identityProvider) {
      const loginToken = await this.app.service('login-token').create({
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
