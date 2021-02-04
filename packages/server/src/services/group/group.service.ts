import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { Group } from './group.class';
import createModel from '../../models/group.model';
import hooks from './group.hooks';
import groupDocs from "./group.docs";

declare module '../../declarations' {
  interface ServiceTypes {
    'group': Group & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    events: ['refresh'],
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  const event = new Group(options, app);
  event.docs = groupDocs;

  app.use('/group', event);

  const service = app.service('group');

  service.hooks(hooks);

  service.publish('created', async (data): Promise<any> => {
    const groupUsers = await app.service('group-user').find({
      query: {
        $limit: 1000,
        groupId: data.id
      }
    }) as any;
    await Promise.all(groupUsers.data.map(async (groupUser) => {
      const avatarResult = await app.service('static-resource').find({
        query: {
          staticResourceType: 'user-thumbnail',
          userId: groupUser.userId
        }
      }) as any;

      if (avatarResult.total > 0) {
        groupUser.dataValues.user.dataValues.avatarUrl = avatarResult.data[0].url;
      }

      return await Promise.resolve();
    }));
    data.groupUsers = groupUsers.data;
    const targetIds = (groupUsers).data.map((groupUser) => {
      return groupUser.userId;
    });
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(targetIds.map((userId: string) => {
      return app.channel(`userIds/${userId}`).send({
        group: data
      });
    }));
  });

  service.publish('patched', async (data): Promise<any> => {
    const groupUsers = await app.service('group-user').find({
      query: {
        $limit: 1000,
        groupId: data.id
      }
    }) as any;
    await Promise.all(groupUsers.data.map(async (groupUser) => {
      const avatarResult = await app.service('static-resource').find({
        query: {
          staticResourceType: 'user-thumbnail',
          userId: groupUser.userId
        }
      }) as any;

      if (avatarResult.total > 0) {
        groupUser.dataValues.user.dataValues.avatarUrl = avatarResult.data[0].url;
      }

      return await Promise.resolve();
    }));
    data.groupUsers = groupUsers.data;
    const targetIds = (groupUsers).data.map((groupUser) => {
      return groupUser.userId;
    });
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(targetIds.map((userId: string) => {
      return app.channel(`userIds/${userId}`).send({
        group: data
      });
    }));
  });

  service.publish('removed', async (data): Promise<any> => {
    const groupUsers = await app.service('group-user').find({
      query: {
        $limit: 1000,
        groupId: data.id
      }
    });
    const targetIds = (groupUsers as any).data.map((groupUser) => {
      return groupUser.userId;
    });
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(targetIds.map((userId: string) => {
      return app.channel(`userIds/${userId}`).send({
        group: data
      });
    }));
  });

  service.publish('refresh', async (data): Promise<any> => {
    return app.channel(`userIds/${data.userId}`).send({});
  });
};
