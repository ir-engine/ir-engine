import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import * as path from 'path'
import * as pug from 'pug'
import requireMainFilename from 'require-main-filename'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { sendEmail } from '../auth-management/auth-management.utils'

/**
 * A class for Report Issue service
 *
 * @author IRANKUNDA Fabrice
 */
interface Data {}
interface ServiceOptions {}
export class ReportIssue implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async sendEmail(data: any, user: any): Promise<void> {
    const appPath = path.dirname(requireMainFilename())
    const emailAccountTemplatesPath = path.join(appPath, '..', '..', 'server-core', 'email-templates', 'report-issue')
    const templatePath = path.join(emailAccountTemplatesPath, 'report-issue.pug')

    const compiledHTML = pug.compileFile(templatePath)({
      title: config.client.title,
      data,
      username: user.name
    })
    const mailSender = config.email.from
    const email = {
      from: mailSender,
      to: 'irankundafabrice9@gmail.com', // For testing purpose,
      subject: config.email.subject.report,
      html: compiledHTML
    }

    return await sendEmail(this.app, email)
  }

  async setup() {}

  async find(params?: Params): Promise<Data> {
    return []
  }

  async get(id: Id, params?: Params): Promise<Data> {
    return {
      id,
      text: `A new message with ID: ${id}!`
    }
  }

  async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data
  }

  async remove(id: NullableId, params?: Params): Promise<Data> {
    return { id }
  }

  async create(data: any, params?: Params): Promise<Data> {
    const loggedInUser = params!.user as any
    // To DO
    console.log('...........', JSON.stringify(data))
    await this.sendEmail(data, loggedInUser)
    return data
  }
}
