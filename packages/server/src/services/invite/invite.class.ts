import { Service, SequelizeServiceOptions } from 'feathers-sequelize';
import { Application } from '../../declarations';
import {
  Params
} from '@feathersjs/feathers';

export class Invite extends Service {
  app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options);
    this.app = app;
  }

  async find (params: Params): Promise<any> {
    const query = params.query;
    if (query.type === 'received') {
      const identityProviders = await this.app.service('identity-provider').find({
        query: {
          userId: query.userId
        }
      });
      const identityProviderTokens = (identityProviders as any).data.map((provider) => provider.token);
      const result = await super.find({
        query: {
          $or: [
            { inviteeId: query.userId },
            {
              token: {
                $in: identityProviderTokens
              }
            }
          ],
          $limit: query.$limit || 10,
          $skip: query.$skip || 0
        }
      });

      await Promise.all((result as any).data.map(async (invite) => {
        if (invite.inviteType === 'group') {
          try {
            const group = await this.app.service('group').get(invite.targetObjectId);
            invite.groupName = group.name;
          } catch(err) {
            invite.groupName = '&ltA deleted group&gt';
          }
        }
      }));

      return result;
    } else {
      const result = await super.find({
        query: {
          userId: query.userId,
          $limit: query.$limit || 10,
          $skip: query.$skip || 0
        }
      });

      await Promise.all((result as any).data.map(async (invite) => {
        if (invite.inviteType === 'group') {
          try {
            const group = await this.app.service('group').get(invite.targetObjectId);
            invite.groupName = group.name;
          } catch(err) {
            invite.groupName = '&ltA deleted group&gt';
          }
        }
      }));

      return result;
    }
  }
}
