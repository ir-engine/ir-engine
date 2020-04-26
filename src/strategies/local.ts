import { Params } from '@feathersjs/feathers';
import { LocalStrategy } from '@feathersjs/authentication-local';
import { NotAuthenticated } from '@feathersjs/errors';
import { Service } from 'feathers-sequelize';

export class MyLocalStrategy extends LocalStrategy {
  async findEntity(username: string, params: Params): Promise<any> {
    const { service, errorMessage } = this.configuration;
    if (!username) {
      throw new NotAuthenticated(errorMessage)
    }

    const entityService: Service = this.app?.service(service);
    const userService: Service = this.app?.service('user');

    const result = (await entityService.find({
      query: {
        token: username,
        accountType: 'password'
      },
    })) as any

    const identityProviders = result.data
    
    if (identityProviders.length == 0) {
      throw new NotAuthenticated(errorMessage);
    }
    
    const identityProvider = identityProviders[0]
    const user = await userService.get(identityProvider.userId)

    return {...user, ...identityProvider}
  }

  async comparePassword(user: any, password: string): Promise<any> {
    if (user.password === password) {
      return user
    }

    throw new NotAuthenticated("Invalid password");
  }

  // async getEntityQuery(query: Query, params: Params) {
  //   const sequelizeClient: Sequelize = this.app?.get('sequelizeClient')
  //   const IdentityProvider = sequelizeClient.model('identity_provider')
  //   const User = sequelizeClient.model('user')

  //   const users = await User.findAll({
  //     where: {
  //       "$identity_providers.token$": query.email
  //     },
  //     include: [
  //       IdentityProvider
  //     ]
  //   })

  //   console.error('----------', users);
  //   params.sequelize = {
  //     include: [
  //       {
  //         model: IdentityProvider
  //       }
  //     ]
  //   }
  //   return {
  //     "$identity_providers.token$": query.email,
  //     $limit: 1
  //   }
  // }
}
