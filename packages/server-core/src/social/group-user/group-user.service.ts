import { Application } from '../../../declarations'
import logger from '../../logger'
import { GroupUser } from './group-user.class'
import groupUserDocs from './group-user.docs'
import hooks from './group-user.hooks'
import createModel from './group-user.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    'group-user': GroupUser
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new GroupUser(options, app)
  event.docs = groupUserDocs
  app.use('group-user', event)

  const service = app.service('group-user')

  service.hooks(hooks)

  /**
   * A method which is used to create group user
   *
   * @param data which is parsed to create group user
   * @returns created group user
   * @author Vyacheslav Solovjov
   */
  service.publish('created', async (data): Promise<any> => {
    try {
      await app.service('group').emit('refresh', {
        userId: data.userId
      })
      // const channel = await (app.service('channel') as any).Model.findOne({
      //   where: {
      //     groupId: data.groupId
      //   }
      // });
      // if (channel != null) {
      //   await app.service('channel').patch(channel.id, {
      //     channelType: channel.channelType
      //   }, {
      //     sequelize: {
      //       silent: true
      //     }
      //   });
      // }
      const groupUsers = await app.service('group-user').find({
        query: {
          $limit: 1000,
          groupId: data.groupId
        }
      })
      data.user = await app.service('user').get(data.userId)
      // const avatarResult = await app.service('static-resource').find({
      //   query: {
      //     staticResourceType: 'user-thumbnail',
      //     userId: data.userId
      //   }
      // }) as any;
      //
      // if (avatarResult.total > 0) {
      //   data.user.dataValues.avatarUrl = avatarResult.data[0].url;
      // }
      const targetIds = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId
      })
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            groupUser: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  /**
   * A method used to update group user
   *
   * @param data which is used to update group user
   * @returns updated GroupUser data
   * @author Vyacheslav Solovjov
   */
  service.publish('patched', async (data): Promise<any> => {
    try {
      // const channel = await (app.service('channel') as any).Model.findOne({
      //   where: {
      //     groupId: data.groupId
      //   }
      // });
      // if (channel != null) {
      //   await app.service('channel').patch(channel.id, {
      //     channelType: channel.channelType
      //   }, {
      //     sequelize: {
      //       silent: true
      //     }
      //   });
      // }
      const groupUsers = await app.service('group-user').find({
        query: {
          $limit: 1000,
          groupId: data.groupId
        }
      })
      data.user = await app.service('user').get(data.userId)
      // const avatarResult = await app.service('static-resource').find({
      //   query: {
      //     staticResourceType: 'user-thumbnail',
      //     userId: data.userId
      //   }
      // }) as any;
      //
      // if (avatarResult.total > 0) {
      //   data.user.dataValues.avatarUrl = avatarResult.data[0].url;
      // }

      const targetIds = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId
      })
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            groupUser: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  /**
   * A method used to remove specific groupUser
   *
   * @param data which contains groupId
   * @returns deleted channel data
   * @author Vyacheslav Solovjov
   */
  service.publish('removed', async (data): Promise<any> => {
    try {
      // const channel = await (app.service('channel') as any).Model.findOne({
      //   where: {
      //     groupId: data.groupId
      //   }
      // });
      // if (channel != null) {
      //   await app.service('channel').patch(channel.id, {
      //     channelType: channel.channelType
      //   }, {
      //     sequelize: {
      //       silent: true
      //     }
      //   });
      // }
      const groupUsers = await app.service('group-user').find({
        query: {
          $limit: 1000,
          groupId: data.groupId
        }
      })
      const targetIds = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId
      })
      targetIds.push(data.userId)
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId: string) => {
          return app.channel(`userIds/${userId}`).send({
            groupUser: data,
            self: userId === data.userId
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })
}
