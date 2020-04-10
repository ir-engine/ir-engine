// Initializes the `email` service on path `/email`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Email } from './email.class'
import hooks from './email.hooks'
import smtpTransport from 'nodemailer-smtp-transport'
import Mailer from 'feathers-mailer'

// Add this service to the service type index
declare module '../../declarations' {
  interface ServiceTypes {
    'email': Email & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  // Initialize our service with any options it requires
  app.use('/email', Mailer(smtpTransport({
    host: process.env.SMTP_HOST,
    secure: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })))

  // Get our initialized service so that we can register hooks
  const service = app.service('email')

  service.hooks(hooks)
}
