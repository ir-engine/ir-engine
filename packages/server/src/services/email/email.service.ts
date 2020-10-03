import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Email } from './email.class';
import hooks from './email.hooks';
import smtpTransport from 'nodemailer-smtp-transport';
import Mailer from 'feathers-mailer';
import config from '../../config';

declare module '../../declarations' {
  interface ServiceTypes {
    'email': Email & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  app.use('/email', Mailer(smtpTransport({ ...config.email.smtp })));

  const service = app.service('email');

  service.hooks(hooks);
};
