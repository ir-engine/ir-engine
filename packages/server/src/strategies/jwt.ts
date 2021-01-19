import { Params } from '@feathersjs/feathers'
import { JWTStrategy } from '@feathersjs/authentication';
import { NotFound } from '@feathersjs/errors'
// import { Service } from 'feathers-sequelize'

// TODO: Why is all this commented out? Can we remove it/clean up?
export class MyJwtStrategy extends JWTStrategy {
  async getEntity(id: string, params: Params): Promise<any> {
      try {
          const entity = await super.getEntity(id, params);
          return entity;
      } catch(err) {
          console.log('Error getting Identity Provider ' + id);
          console.log(params);
          throw new NotFound('Could not find Identity Provider');
      }

    // const { entity } = this.configuration;
    // const entityService = this.entityService;
    //
    // console.log('=========', entity, entityService);
    // if (entityService === null) {
    //     throw new NotAuthenticated(`Could not find entity service`);
    // }
    //
    // const result = ((await entityService.find({
    //   query: {
    //     userId,
    //     type: 'password'
    //   }
    // })) as any).data
    //
    // console.log(result, '############')
    //
    // if (result.length === 0) {
    //   throw new NotAuthenticated(`Could not find user`);
    // }
    //
    // return result[0];
  }

  async authenticate(data: any, params: Params): Promise<any> {
      try {
          const result = await super.authenticate(data, params);
          return result;
      } catch(err) {
          console.log('JWT authenticate error');
          console.log(err);
          throw err;
      }
  }
}
