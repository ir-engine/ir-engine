import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import moment from 'moment';
import logger from '../../app/logger';

interface Data {}

interface ServiceOptions {}

export class Login implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  docs: any

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options;
    this.app = app;
  }

  async find (params?: Params): Promise<Data[] | Paginated<Data>> {
    return [];
  }

  async get (id: Id, params?: Params): Promise<any> {
    try {
      const result = await this.app.service('login-token').Model.findOne({
        where: {
          token: id
        }
      });
      if (result == null) {
        console.log('Invalid login token');
        return {
          error: 'invalid login token'
        };
      }
      if (moment().utc().toDate() > result.expiresAt) {
        console.log('Login Token has expired');
        return { error: 'Login link has expired' };
      }
      const identityProvider = await this.app.service('identity-provider').get(result.identityProviderId);
      const token = await this.app.service('authentication').createAccessToken(
        {},
        { subject: identityProvider.id.toString() }
      );
      return {
        token: token
      };
    } catch (err) {
      logger.error(err);
      throw err;
    }
  }

  async create (data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map(current => this.create(current, params)));
    }

    return data;
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
}
