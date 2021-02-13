import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Email } from './email.class';
import hooks from './email.hooks';
import smtpTransport from 'nodemailer-smtp-transport';
import Mailer from 'feathers-mailer';
import config from '../../config';
import emailDocs from './email.docs';

declare module '../../declarations' {
  interface ServiceTypes {
    'email': Email & ServiceAddons<any>;
  }
}

export default (app: Application): void => {

  /**
   * Initialize our service with any options it requires and docs 
   * 
   * @author Vyacheslav Solovjov
   */
  const event = Mailer(smtpTransport({ ...config.email.smtp }));
  event.docs =  emailDocs;
  app.use('/email',  event );

  const service = app.service('email');

  service.hooks(hooks);
};
