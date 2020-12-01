import CustomOAuthStrategy from './custom-oauth';
import { Params } from '@feathersjs/feathers';
import config from '../config';
import app from "../app";

export default class Googlestrategy extends CustomOAuthStrategy {
  async getEntityData (profile: any, params?: Params): Promise<any> {
    const baseData = await super.getEntityData(profile, null, {});
    const userId = (params?.query) ? params.query.userId : undefined;
    return {
      ...baseData,
      email: profile.email,
      type: 'google',
      userId
    };
  }

  async updateEntity(entity: any, profile: any, params?: Params): Promise<any> {
    const authResult = await app.service('authentication').strategies.jwt.authenticate({ accessToken: params?.authentication?.accessToken }, {});
    const identityProvider = authResult['identity-provider'];
    await app.service('user').patch(entity.userId, {
      userRole: 'user'
    });
    if (entity.type !== 'guest') {
      await app.service('identity-provider').remove(identityProvider.id);
      await app.service('user').remove(identityProvider.userId);
    }
    return super.updateEntity(entity, profile, params);
  }

  async getRedirect (data: any, params?: Params): Promise<string> {
    const redirectHost = config.authentication.callback.google;

    const type = (params?.query?.userId) ? 'connection' : 'login';
    if (Object.getPrototypeOf(data) === Error.prototype) {
      const err = data.message as string;
      return redirectHost + `?error=${err}`;
    } else {
      const token = data.accessToken as string;
      return redirectHost + `?token=${token}&type=${type}`;
    }
  }
}
