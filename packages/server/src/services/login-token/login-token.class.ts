import config from '../../config';
import crypto from 'crypto';
import moment from 'moment';
import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';

export class LoginToken extends Service {
  app: Application
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create (data: any): Promise<any> {
    const { identityProviderId } = data;
    const token = crypto.randomBytes(config.authentication.bearerToken.numBytes).toString('hex');

    return await super.create({
      identityProviderId: identityProviderId,
      token: token,
      expiresAt: moment().utc().add(2, 'days').toDate()
    });
  }
}
