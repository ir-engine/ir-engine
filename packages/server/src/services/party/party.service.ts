import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Party } from './party.class';
import createModel from '../../models/party.model';
import hooks from './party.hooks';
import partyDocs from './party.docs';

declare module '../../declarations' {
  interface ServiceTypes {
    'party': Party & ServiceAddons<any>;
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    multi: true
  };

  const event = new Party(options, app);
  event.docs = partyDocs;
  
  app.use('/party', event);

  const service = app.service('party');

  service.hooks(hooks);

  service.publish('created', async (data): Promise<any> => {
    const partyUsers = await app.service('party-user').find({
      query: {
        $limit: 1000,
        partyId: data.id
      }
    }) as any;
    await Promise.all(partyUsers.data.map(async (partyUser) => {
      const avatarResult = await app.service('static-resource').find({
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
    data.partyUsers = partyUsers.data;
    const targetIds = (partyUsers).data.map((partyUser) => {
      return partyUser.userId;
    });
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(targetIds.map((userId: string) => {
      return app.channel(`userIds/${userId}`).send({
        party: data
      });
    }));
  });

  service.publish('patched', async (data): Promise<any> => {
    const partyUsers = await app.service('party-user').find({
      query: {
        $limit: 1000,
        partyId: data.id
      }
    });
    const targetIds = (partyUsers as any).data.map((partyUser) => {
      return partyUser.userId;
    });
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(targetIds.map((userId: string) => {
      return app.channel(`userIds/${userId}`).send({
        party: data
      });
    }));
  });

  service.publish('removed', async (data): Promise<any> => {
    const partyUsers = await app.service('party-user').find({
      query: {
        $limit: 1000,
        partyId: data.id
      }
    });
    const targetIds = (partyUsers as any).data.map((partyUser) => {
      return partyUser.userId;
    });
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(targetIds.map((userId: string) => {
      return app.channel(`userIds/${userId}`).send({
        party: data
      });
    }));
  });
};
