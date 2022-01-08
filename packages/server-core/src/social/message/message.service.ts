import { Application } from '../../../declarations'
import { Message } from './message.class'
import messageDocs from './message.docs'
import hooks from './message.hooks'
import createModel from './message.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    message: Message
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new Message(options, app)
  event.docs = messageDocs
  app.use('message', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('message')

  service.hooks(hooks)

  /**
   * A function which is used to create message
   *
   * @param data of new message
   * @returns {@Object} created message
   * @author Vyacheslav Solovjov
   */
  service.publish('created', async (data): Promise<any> => {
    data.sender = await app.service('user').get(data.senderId)
    const channel = await app.service('channel').get(data.channelId)
    let targetIds: any[] = []
    if (channel.channelType === 'party') {
      const partyUsers = await app.service('party-user').find({
        query: {
          $limit: 1000,
          partyId: channel.partyId
        }
      })

      targetIds = (partyUsers as any).data.map((partyUser) => {
        return partyUser.userId
      })
    } else if (channel.channelType === 'group') {
      const groupUsers = await app.service('group-user').find({
        query: {
          $limit: 1000,
          groupId: channel.groupId
        }
      })

      targetIds = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId
      })
    } else if (channel.channelType === 'instance') {
      const instanceUsers = await app.service('user').find({
        query: {
          $limit: 1000,
          instanceId: channel.instanceId,
          action: 'layer-users'
        }
      })

      targetIds = (instanceUsers as any).data.map((instanceUser) => {
        return instanceUser.id
      })
    } else if (channel.channelType === 'user') {
      targetIds = [channel.userId1, channel.userId2]
    }
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(
      targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          message: data
        })
      })
    )
  })

  /**
   * A function which used to remove single message
   *
   * @param data contains sender
   * @returns removed data
   * @author Vyacheslav Solovjov
   */
  service.publish('removed', async (data): Promise<any> => {
    data.sender = await app.service('user').get(data.senderId)
    const channel = await app.service('channel').get(data.channelId)
    let targetIds: any[] = []
    if (channel.channelType === 'party') {
      const partyUsers = await app.service('party-user').find({
        query: {
          $limit: 1000,
          partyId: channel.partyId
        }
      })

      targetIds = (partyUsers as any).data.map((partyUser) => {
        return partyUser.userId
      })
    } else if (channel.channelType === 'group') {
      const groupUsers = await app.service('group-user').find({
        query: {
          $limit: 1000,
          groupId: channel.groupId
        }
      })

      targetIds = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId
      })
    } else if (channel.channelType === 'instance') {
      const instanceUsers = await app.service('user').find({
        query: {
          $limit: 1000,
          instanceId: channel.instanceId,
          action: 'layer-users'
        }
      })

      targetIds = (instanceUsers as any).data.map((instanceUser) => {
        return instanceUser.id
      })
    } else if (channel.channelType === 'user') {
      targetIds = [channel.userId1, channel.userId2]
    }
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(
      targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          message: data
        })
      })
    )
  })

  /**
   * A function which is used to update mesasge
   *
   * @param data of updated message
   * @returns {@Object} updated message
   * @author Vyacheslav Solovjov
   */
  service.publish('patched', async (data): Promise<any> => {
    data.sender = await app.service('user').get(data.senderId)
    const channel = await app.service('channel').get(data.channelId)
    let targetIds: any[] = []
    if (channel.channelType === 'party') {
      const partyUsers = await app.service('party-user').find({
        query: {
          $limit: 1000,
          partyId: channel.partyId
        }
      })

      targetIds = (partyUsers as any).data.map((partyUser) => {
        return partyUser.userId
      })
    } else if (channel.channelType === 'group') {
      const groupUsers = await app.service('group-user').find({
        query: {
          $limit: 1000,
          groupId: channel.groupId
        }
      })

      targetIds = (groupUsers as any).data.map((groupUser) => {
        return groupUser.userId
      })
    } else if (channel.channelType === 'instance') {
      const instanceUsers = await app.service('user').find({
        query: {
          $limit: 1000,
          instanceId: channel.instanceId,
          action: 'layer-users'
        }
      })

      targetIds = (instanceUsers as any).data.map((instanceUser) => {
        return instanceUser.id
      })
    } else if (channel.channelType === 'user') {
      targetIds = [channel.userId1, channel.userId2]
    }
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(
      targetIds.map((userId: string) => {
        return app.channel(`userIds/${userId}`).send({
          message: data
        })
      })
    )
  })
}
