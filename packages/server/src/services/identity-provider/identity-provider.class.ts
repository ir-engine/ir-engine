import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import { Sequelize } from 'sequelize';
import { v1 as uuidv1 } from 'uuid';

interface Data {
  userId: string;
}

export class IdentityProvider extends Service {
  public app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async create (data: any, params: any): Promise<any> {
    const {
      token,
      type,
      password
    } = data;

    // if userId is in data, the we add this identity provider to the user with userId
    // if not, we create a new user
    let userId = data.userId;
    let identityProvider: any;

    switch (type) {
      case 'email':
        identityProvider = {
          token,
          type
        };
        break;
      case 'sms':
        identityProvider = {
          token,
          type
        };
        break;
      case 'password':
        identityProvider = {
          token,
          password,
          type
        };
        break;
      case 'github':
        identityProvider = {
          token: token,
          type
        };
        break;
      case 'facebook':
        identityProvider = {
          token: token,
          type
        };
        break;
      case 'google':
        identityProvider = {
          token: token,
          type
        };
        break;
      case 'guest':
        identityProvider = {
          token: token,
          type: type
        };
        break;
      case 'auth0':
        break;
    }

    // if userId is not defined, then generate userId
    if (!userId) {
      userId = uuidv1();
    }

    const sequelizeClient: Sequelize = this.app.get('sequelizeClient');
    const userService = this.app.service('user');
    const User = sequelizeClient.model('user');

    // check if there is a user with userId
    const foundUser = ((await userService.find({
      query: {
        id: userId
      }
    }))).data;

    if (foundUser.length > 0) {
      // if there is the user with userId, then we add the identity provider to the user
      return await super.create({
        ...data,
        ...identityProvider,
        userId
      }, params);
    }

    // create with user association
    params.sequelize = {
      include: [User]
    };

    // if there is no user with userId, then we create a user and a identity provider.
    const result = await super.create({
      ...data,
      ...identityProvider,
      user: {
        id: userId
      }
    }, params);

    if (type === 'guest') {
      console.log('Doing guest update things')
      console.log('identityProvider:')
      console.log(result)
      await userService.patch(userId, {
        userRole: 'guest'
      });

      result.accessToken = await this.app.service('authentication').createAccessToken(
          {},
          { subject: result.id.toString() }
      );
    }

    return result;
  }
}
