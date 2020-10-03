// import { Params } from '@feathersjs/feathers'
import { JWTStrategy } from '@feathersjs/authentication';
// import { NotAuthenticated } from '@feathersjs/errors'
// import { Service } from 'feathers-sequelize'

// TODO: Why is all this commented out? Can we remove it/clean up?
export class MyJwtStrategy extends JWTStrategy {
  // async getEntity(userId: string, params: Params): Promise<any> {
  //   const { entity } = this.configuration;
  //   const entityService = this.entityService;

  //   console.log('=========', entity, entityService);
  //   if (entityService === null) {
  //       throw new NotAuthenticated(`Could not find entity service`);
  //   }

  //   const result = ((await entityService.find({
  //     query: {
  //       userId,
  //       type: 'password'
  //     }
  //   })) as any).data

  //   console.log(result, '############')

  //   if (result.length === 0) {
  //     throw new NotAuthenticated(`Could not find user`);
  //   }

  //   return result[0];
  // }
}
