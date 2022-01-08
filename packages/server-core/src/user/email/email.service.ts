import Mailer from 'feathers-mailer'
import smtpTransport from 'nodemailer-smtp-transport'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { Email } from './email.class'
import emailDocs from './email.docs'
import hooks from './email.hooks'

declare module '../../../declarations' {
  interface ServiceTypes {
    email: Email
  }
}

export default (app: Application): void => {
  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = Mailer(smtpTransport({ ...config.email.smtp }))
  event.docs = emailDocs
  app.use('email', event)

  const service = app.service('email')

  service.hooks(hooks)
}
