import { ServiceAddons } from '@feathersjs/feathers';
import { Application } from '../../declarations';
import { GroupUser } from './group-user.class';
import createModel from '../../models/group-user.model';
import hooks from './group-user.hooks';
import logger from '../../app/logger';

declare module '../../declarations' {
  interface ServiceTypes {
    'group-user': GroupUser & ServiceAddons<any>;
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  };

  app.use('/group-user', new GroupUser(options, app));

  const service = app.service('group-user');

  service.hooks(hooks);

  service.publish('created', async (data): Promise<any> => {
    try {
      await app.service('group').emit('refresh', {
        userId: data.userId
      });
      const channel = await app.service('channel').Model.findOne({
        where: {
          groupId: data.groupId
        }
      });
      if (channel != null) {
        await app.service('channel').patch(channel.id, {
          channelType: channel.channelType
        }, {
          sequelize: {
            silent: true
          }
        });
      }
      const groupUsers = await app.service('group-user').find({
        query: {
          $limit: 1000,
          groupId: data.groupId
        }
      });
      data.user = await app.service('user').get(data.userId);
      const avatarResult = await app.service('static-resource').find({
        query: {
          staticResourceType: 'user-thumbnail',
          userId: data.userId
        }
      }) as any;

      if (avatarResult.total > 0) {
        data.user.dataValues.avatarUrl = avatarResult.data[0].url;
      }
      const targetIds = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId;
      });
      return Promise.all(targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          groupUser: data
        });
      }));
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  service.publish('patched', async (data): Promise<any> => {
    try {
      const channel = await app.service('channel').Model.findOne({
        where: {
          groupId: data.groupId
        }
      });
      if (channel != null) {
        await app.service('channel').patch(channel.id, {
          channelType: channel.channelType
        }, {
          sequelize: {
            silent: true
          }
        });
      }
      const groupUsers = await app.service('group-user').find({
        query: {
          $limit: 1000,
          groupId: data.groupId
        }
      });
      data.user = await app.service('user').get(data.userId);
      const avatarResult = await app.service('static-resource').find({
        query: {
          staticResourceType: 'user-thumbnail',
          userId: data.userId
        }
      }) as any;

      if (avatarResult.total > 0) {
        data.user.dataValues.avatarUrl = avatarResult.data[0].url;
      }

      const targetIds = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId;
      });
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          groupUser: data
        });
      }));
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });

  service.publish('removed', async (data): Promise<any> => {
    try {
      const channel = await app.service('channel').Model.findOne({
        where: {
          groupId: data.groupId
        }
      });
      if (channel != null) {
        await app.service('channel').patch(channel.id, {
          channelType: channel.channelType
        }, {
          sequelize: {
            silent: true
          }
        });
      }
      const groupUsers = await app.service('group-user').find({
        query: {
          $limit: 1000,
          groupId: data.groupId
        }
      });
      const targetIds = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId;
      });
      targetIds.push(data.userId);
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          groupUser: data,
          self: userId === data.userId
        });
      }));
    } catch (err) {
      logger.error(err);
      throw err;
    }
  });
};
