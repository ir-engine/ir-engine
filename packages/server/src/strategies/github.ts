import CustomOAuthStrategy from './custom-oauth';
import { Params } from '@feathersjs/feathers';
import config from '../config';
import app from '../app';

export default class GithubStrategy extends CustomOAuthStrategy {
  async getEntityData (profile: any, entity: any, params?: Params): Promise<any> {
    const baseData = await super.getEntityData(profile, null, {});
    const userId = (params?.query) ? params.query.userId : undefined;
    return {
      ...baseData,
      email: profile.email,
      type: 'github',
      userId
    };
  }

  async updateEntity(entity: any, profile: any, params?: Params): Promise<any> {
    console.log('Github JWT authenticate');
    const authResult = await app.service('authentication').strategies.jwt.authenticate({ accessToken: params?.authentication?.accessToken }, {});
    const identityProvider = authResult['identity-provider'];
    const user = await app.service('user').get(entity.userId);
    await app.service('user').patch(entity.userId, {
      userRole: user?.userRole === 'admin' ? 'admin' : 'user'
    });
    if (entity.type !== 'guest') {
      await app.service('identity-provider').remove(identityProvider.id);
      await app.service('user').remove(identityProvider.userId);
    }
    return super.updateEntity(entity, profile, params);
  }

  async getRedirect (data: any, params?: Params): Promise<string> {
    console.log('Github getRedirect');
    console.log(data);
    console.log(params);
    const redirectHost = config.authentication.callback.github;

    const type = (params?.query?.userId) ? 'connection' : 'login';
    if (Object.getPrototypeOf(data) === Error.prototype) {
      const err = data.message as string;
      return redirectHost + `?error=${err}`;
    } else {
      const token = data.accessToken as string;
      const redirect = params.redirect;
      const redirectSplit = redirect.split(',');
      const split0 = redirectSplit[0].split(':');
      const split1 = redirectSplit.length > 1 ? redirectSplit[1].split(':') : null;
      const path = split0[0] === 'path' ? split0[1] : split1 != null && split1[0] === 'path' ? split1[1] : null;
      const instanceId = split0[0] === 'instanceId' ? split0[1] : split1 != null && split1[0] === 'instanceId' ? split1[1] : null;
      let returned = redirectHost + `?token=${token}&type=${type}`;
      if (path != null) returned = returned.concat(`&path=${path}`);
      if (instanceId != null) returned = returned.concat(`&instanceId=${instanceId}`);
      console.log('Redirecting to ' + returned);
      return returned;
    }
  }
}
