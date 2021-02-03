import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
// import { Params, Id, NullableId } from '@feathersjs/feathers'

import { Application } from '../../declarations';
import { Params } from '@feathersjs/feathers';
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils';
// import { Forbidden } from '@feathersjs/errors'

export class Party extends Service {
  app: Application
  docs: any

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async get (id: string | null, params?: Params): Promise<any> {
    if (id == null) {
      const loggedInUser = extractLoggedInUserFromParams(params);
      const partyUserResult = await this.app.service('party-user').find({
        query: {
          userId: loggedInUser.userId
        }
      });

      if ((partyUserResult as any).total === 0) {
        return null;
      }

      const partyId = (partyUserResult as any).data[0].partyId;

      const party = await super.get(partyId);

      const partyUsers = await this.app.service('party-user').Model.findAll({
        where: {
          partyId: party.id
        },
        include: [
          {
            model: this.app.service('user').Model
          }
        ]
      });
      await Promise.all(partyUsers.map(async (partyUser) => {
        const avatarResult = await this.app.service('static-resource').find({
          query: {
            staticResourceType: 'user-thumbnail',
            userId: partyUser.userId
          }
        }) as any;

        if (avatarResult.total > 0) {
          partyUser.dataValues.user.dataValues.avatarUrl = avatarResult.data[0].url;
        }

        return await Promise.resolve();
      }));

      party.partyUsers = partyUsers;

      return party;
    } else {
      return await super.get(id);
    }
  }
}
