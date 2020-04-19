import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { getLink, sendEmail } from '../auth-management/utils'
import * as path from 'path'
import * as pug from 'pug'

interface Data {}

interface ServiceOptions {}

export class Magiclink implements ServiceMethods<Data> {
  app: Application;
  options: ServiceOptions;

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return []
  }

  async get (id: Id, params?: Params): Promise<Data> {
    return {
      id, text: `A new message with ID: ${id}!`
    }
  }

  async sendEmail (toEmail: string, token: string): Promise<void> {
    const hashLink = getLink('login', token)
    const appPath = path.dirname(require.main ? require.main.filename : '')
    const emailAccountTemplatesPath =
      path.join(appPath, '..', 'src', 'email-templates', 'account')
    const mailFrom = process.env.MAIL_FROM ?? 'noreply@myxr.email'

    const templatePath = path.join(emailAccountTemplatesPath, 'magiclink-email.pug')
    const compiledHTML = pug.compileFile(templatePath)({
      logo: '',
      hashLink
    })

    const email = {
      from: mailFrom,
      to: toEmail,
      subject: 'Magic Link to sign in',
      html: compiledHTML
    }

    return await sendEmail(this.app, email)
  }

  async create (data: any, params?: Params): Promise<Data> {
    const userService = this.app.service('user')
    const authService = this.app.service('authentication')
    let user

    if (data.type === 'email') {
      const users = ((await userService.find({
        query: {
          email: data.email
        }
      })) as any).data

      if (users.length === 0) {
        user = await userService.create({
          email: data.email
        }, params)
      } else {
        user = users[0]
      }

      if (user) {
        const accessToken = await authService.createAccessToken({}, { subject: user.userId.toString() })

        await this.sendEmail(data.email, accessToken)
      }
    } else if (data.type === 'sms') {
      user = await userService.find({
        query: {
          mobile: data.mobile
        }
      })

      if (!user) {
        user = await userService.create({
          mobile: data.mobile
        }, params)
      }

      // TODO! send sms.
    }
    return data
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id }
  }
}
