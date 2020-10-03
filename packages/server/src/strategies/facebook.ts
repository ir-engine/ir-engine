import CustomOAuthStrategy from './custom-oauth';
import { Params } from '@feathersjs/feathers';
import config from '../config';

export default class FacebookStrategy extends CustomOAuthStrategy {
  async getEntityData (profile: any, params?: Params): Promise<any> {
    const baseData = await super.getEntityData(profile, null, {});
    const userId = (params?.query) ? params.query.userId : undefined;
    return {
      ...baseData,
      email: profile.email,
      type: 'facebook',
      userId
    };
  }

  async getRedirect (data: any, params?: Params): Promise<string> {
    const redirectHost = config.authentication.callback.facebook;

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
