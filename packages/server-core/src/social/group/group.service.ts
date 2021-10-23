import { Application } from '../../../declarations'
import { Group } from './group.class'
import createModel from './group.model'
import hooks from './group.hooks'
import groupDocs from './group.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    group: Group
  }
}

export default (app: Application) => {
  const options = {
    events: ['refresh'],
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }
  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new Group(options, app)
  event.docs = groupDocs

  app.use('group', event)

  const service = app.service('group')

  service.hooks(hooks)

  /**
   * A method which is used to crate group
   *
   * @param data which is parsed to create group
   * @returns created group data
   * @author Vyacheslav Solovjov
   */
  service.publish('created', async (data): Promise<any> => {
    const groupUsers = (await app.service('group-user').find({
      query: {
        $limit: 1000,
        groupId: data.id
      }
    })) as any
    // await Promise.all(groupUsers.data.map(async (groupUser) => {
    //   const avatarResult = await app.service('static-resource').find({
    //     query: {
    //       staticResourceType: 'user-thumbnail',
    //       userId: groupUser.userId
    //     }
    //   }) as any;
    //
    //   if (avatarResult.total > 0) {
    //     groupUser.dataValues.user.dataValues.avatarUrl = avatarResult.data[0].url;
    //   }
    //
    //   return await Promise.resolve();
    // }));
    data.groupUsers = groupUsers.data
    const targetIds = groupUsers.data.map((groupUser) => {
      return groupUser.userId
    })
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(
      targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          group: data
        })
      })
    )
  })

  /**
   * A method used to update group
   *
   * @param data which is used to update group
   * @returns updated group data
   * @author Vyacheslav Solovjov
   */

  service.publish('patched', async (data): Promise<any> => {
    const groupUsers = (await app.service('group-user').find({
      query: {
        $limit: 1000,
        groupId: data.id
      }
    })) as any
    // await Promise.all(groupUsers.data.map(async (groupUser) => {
    //   const avatarResult = await app.service('static-resource').find({
    //     query: {
    //       staticResourceType: 'user-thumbnail',
    //       userId: groupUser.userId
    //     }
    //   }) as any;
    //
    //   if (avatarResult.total > 0) {
    //     groupUser.dataValues.user.dataValues.avatarUrl = avatarResult.data[0].url;
    //   }
    //
    //   return await Promise.resolve();
    // }));
    data.groupUsers = groupUsers.data
    const targetIds = groupUsers.data.map((groupUser) => {
      return groupUser.userId
    })
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(
      targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          group: data
        })
      })
    )
  })

  /**
   * A method used to remove specific group
   *
   * @param data which contains userId
   * @returns deleted group data
   * @author Vyacheslav Solovjov
   */

  service.publish('removed', async (data): Promise<any> => {
    const groupUsers = await app.service('group-user').find({
      query: {
        $limit: 1000,
        groupId: data.id
      }
    })
    const targetIds = (groupUsers as any).data.map((groupUser) => {
      return groupUser.userId
    })
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(
      targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          group: data
        })
      })
    )
  })

  /**
   * A method used to refresh group
   *
   * @param data which contains userId
   * @returns channel
   */
  service.publish('refresh', async (data): Promise<any> => {
    return app.channel(`userIds/${data.userId}`).send({})
  })
}
