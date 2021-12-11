import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import Paginated from '../../types/PageObject'
import { Application } from '../../../declarations'
import { getLink, sendEmail, sendSms } from '../auth-management/auth-management.utils'
import * as path from 'path'
import * as pug from 'pug'
import { Service } from 'feathers-sequelize'
import { IdentityProvider } from '../identity-provider/identity-provider.class'
import { BadRequest } from '@feathersjs/errors'
import config from '../../appconfig'
import requireMainFilename from 'require-main-filename'

interface Data {}

interface ServiceOptions {}

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
   * @author Vyacheslav Solovjov
   */
  async find(params: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  /**
   * A function which find specific magic link by id
   *
   * @param id of specific magic link
   * @param params
   * @returns {@Object} contains id of magic link and message
   * @author Vyacheslav Solovjov
   */
  async get(id: Id, params: Params): Promise<Data> {
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
   * @author Vyacheslav Solovjov
   */
  async update(id: NullableId, data: Data, params: Params): Promise<Data> {
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
  async patch(id: NullableId, data: Data, params: Params): Promise<Data> {
    return data
  }
  /**
   * A function which is used to remove magic link
   *
   * @param id of magic link used to remove data
   * @param params
   * @returns id
   */
  async remove(id: NullableId, params: Params): Promise<Data> {
    return { id }
  }

  /**
   * A function used to sent an email
   *
   * @param toEmail email of reciever
   * @param token generated token
   * @param type of login
   * @param name of user
   * @returns {@function} sent email
   * @author Vyacheslav Solovjov
   */
  async sendEmail(
    toEmail: string,
    token: string,
    type: 'connection' | 'login',
    identityProvider: IdentityProvider,
    subscriptionId?: string
  ): Promise<void> {
    const hashLink = getLink(type, token, subscriptionId ?? '')
    const appPath = path.dirname(requireMainFilename())
    const emailAccountTemplatesPath = path.join(appPath, '..', '..', 'server-core', 'email-templates', 'account')

    let subscription
    let username
    if (subscriptionId != null) {
      subscription = await this.app.service('subscription').find({
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
   * @author Vyacheslav Solovjov
   */

  async sendSms(mobile: string, token: string, type: 'connection' | 'login'): Promise<void> {
    const hashLink = getLink(type, token, '')
    const appPath = path.dirname(requireMainFilename())
    const emailAccountTemplatesPath = path.join(appPath, '..', '..', 'server-core', 'email-templates', 'account')
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
   * @author Vyacheslav Solovjov
   */

  async create(data: any, params: Params): Promise<Data> {
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
          type: data.type
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
