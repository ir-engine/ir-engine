import Mailer from 'feathers-mailer'
import smtpTransport from 'nodemailer-smtp-transport'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { ReportIssue } from './report-issue.class'
import hooks from './report-issue.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'report-issue': ReportIssue
  }
}

/**
 * Initialize our service with any options it requires and docs
 *
 * @author IRANKUNDA Fabrice
 */
export default (app: Application): void => {
  const event = new ReportIssue({}, app)
  app.use('report-issue', event)

  const service = app.service('report-issue')

  service.hooks(hooks)
}
