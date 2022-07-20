import { Application } from '../../../declarations'
import { Group } from './group.class'
import groupDocs from './group.docs'
import hooks from './group.hooks'
import createModel from './group.model'

declare module '@xrengine/common/declarations' {
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
   */
  service.publish('created', async (data: Group): Promise<any> => {
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
    // @ts-ignore
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
   */

  service.publish('patched', async (data: Group): Promise<any> => {
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
    // @ts-ignore
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
   */

  service.publish('removed', async (data: Group): Promise<any> => {
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
  service.publish('refresh', async (data: any): Promise<any> => {
    return app.channel(`userIds/${data.userId}`).send({})
  })
}
