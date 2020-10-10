import {
  Id,
  NullableId,
  Paginated,
  Params,
  ServiceMethods
} from '@feathersjs/feathers';
import { Application } from '../../declarations';
import {
  getLink,
  sendEmail,
  sendSms
} from '../auth-management/auth-management.utils';
import * as path from 'path';
import * as pug from 'pug';
import { Service } from 'feathers-sequelize';
import { IdentityProvider } from '../identity-provider/identity-provider.class';
import { BadRequest } from '@feathersjs/errors';
import config from '../../config';
import requireMainFilename from 'require-main-filename';

interface Data {}

interface ServiceOptions {}

export class Magiclink implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return [];
  }

  async get (id: Id, params?: Params): Promise<Data> {
    return {
      id,
      text: `A new message with ID: ${id}!`
    };
  }

  async update (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async patch (id: NullableId, data: Data, params?: Params): Promise<Data> {
    return data;
  }

  async remove (id: NullableId, params?: Params): Promise<Data> {
    return { id };
  }

  async sendEmail (
    toEmail: string,
    token: string,
    type: 'connection' | 'login',
    identityProvider: IdentityProvider,
    subscriptionId?: string
  ): Promise<void> {
    const hashLink = getLink(type, token, subscriptionId ?? '');
    const appPath = path.dirname(requireMainFilename());
    const emailAccountTemplatesPath = path.join(
      appPath,
      '..',
      'src',
      'email-templates',
      'account'
    );

    let subscription;
    let username;
    if (subscriptionId != null) {
      subscription = await this.app.service('subscription').find({
        id: subscriptionId
      });

      if ((subscription).total === 0) {
        throw new BadRequest('Invalid subscription');
      }

      const subscriptionUser = await this.app.service('user').get((subscription).data[0].userId);

      username = subscriptionUser.name;
    }
    const templatePath = subscriptionId == null ? path.join(
      emailAccountTemplatesPath,
      'magiclink-email.pug'
    ) : path.join(
      emailAccountTemplatesPath,
      'magiclink-email-subscription.pug'
    );

    const compiledHTML = pug.compileFile(templatePath)({
      logo: config.client.logo,
      title: config.client.title,
      hashLink,
      username: username
    });
    const mailSender = config.email.from;
    const email = {
      from: mailSender,
      to: toEmail,
      subject: config.email.subject.login,
      html: compiledHTML
    };

    return await sendEmail(this.app, email);
  }

  async sendSms (
    mobile: string,
    token: string,
    type: 'connection' | 'login'
  ): Promise<void> {
    const hashLink = getLink(type, token, '');
    const appPath = path.dirname(requireMainFilename() );
    const emailAccountTemplatesPath = path.join(
      appPath,
      '..',
      'src',
      'email-templates',
      'account'
    );
    const templatePath = path.join(
      emailAccountTemplatesPath,
      'magiclink-sms.pug'
    );
    const compiledHTML = pug.compileFile(templatePath)({
      title: config.client.title,
      hashLink
    }).replace(/&amp;/g, '&'); // Text message links can't have HTML escaped ampersands.

    const sms = {
      mobile,
      text: compiledHTML
    };
    return await sendSms(this.app, sms);
  }

  async create (data: any, params?: Params): Promise<Data> {
    console.log('Magiclink create')
    const identityProviderService: Service = this.app.service('identity-provider');

    // check magiclink type
    let token = '';
    if (data.type === 'email') token = data.email;
    else if (data.type === 'sms') token = data.mobile;

    let identityProvider;
    const identityProviders = ((await identityProviderService.find({
      query: {
        token: token,
        type: data.type
      }
    })) as any).data;

    if (identityProviders.length === 0) {
      console.log('Creating identity-provider')
      identityProvider = await identityProviderService.create(
        {
          token: token,
          type: data.type,
          userId: data.userId
        },
        params
      );
    } else {
      identityProvider = identityProviders[0];
    }

    if (identityProvider) {
      const loginToken = await this.app.service('login-token').create({
        identityProviderId: identityProvider.id
      });

      if (data.type === 'email') {
        await this.sendEmail(
          data.email,
          loginToken.token,
          data.userId ? 'connection' : 'login',
          identityProvider,
          data.subscriptionId
        );
      } else if (data.type === 'sms') {
        await this.sendSms(
          data.mobile,
          loginToken.token,
          data.userId ? 'connection' : 'login'
        );
      }
    }
    return data;
  }
}
