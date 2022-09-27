import '@feathersjs/transport-commons'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { Channel } from './channel.class'
import channelDocs from './channel.docs'
import hooks from './channel.hooks'
import createModel from './channel.model'

// Add this service to the service type index
declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    channel: Channel
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new Channel(options, app)
  event.docs = channelDocs

  app.use('channel', event)

  const service: any = app.service('channel')

  service.hooks(hooks)

  /**
   * A method which is used to create channel
   *
   * @param data which is parsed to create channel
   * @returns created channel data
   */
  service.publish('created', async (data): Promise<any> => {
    try {
      let targetIds
      if (data.channelType === 'user') {
        data.user1 = await app.service('user').get(data.userId1)
        data.user2 = await app.service('user').get(data.userId2)
        targetIds = []
      } else if (data.channelType === 'group') {
        if (data.group == null) {
          data.group = await app.service('group').Model.findOne({
            where: {
              id: data.groupId
            }
          })
        }
        const groupUsers = await app.service('group-user').Model.findAll({
          where: {
            groupId: data.groupId
          },
          include: [
            {
              model: app.service('user').Model
            }
          ]
        })

        if (data.group?.dataValues) {
          data.group.dataValues.groupUsers = groupUsers
        } else if (data.group) {
          data.group.groupUsers = groupUsers
        }
        targetIds = groupUsers.map((groupUser) => groupUser.userId)
      } else if (data.channelType === 'party') {
        if (data.party == null) data.party = await app.service('party').Model.findOne({ where: { id: data.partyId } })
        const partyUsers = await app.service('party-user').find({ query: { partyId: data.partyId } })

        if (data.party?.dataValues) data.party.dataValues.party_users = partyUsers.data
        else if (data.party) data.party.party_users = partyUsers.data

        targetIds = partyUsers.data.map((partyUser) => partyUser.userId)
      } else if (data.channelType === 'instance') {
        if (data.instance == null) {
          data.instance = await app.service('instance').Model.findOne({
            where: {
              id: data.instanceId,
              ended: false
            }
          })
        }
        const instanceUsers = await app.service('user').Model.findAll({
          where: {
            instanceId: data.instanceId
          }
        })
        if (data.instance?.dataValues) {
          data.instance.dataValues.instanceUsers = instanceUsers
        } else if (data.instance) {
          data.instance.instanceUsers = instanceUsers
        }
        targetIds = instanceUsers.map((instanceUser) => instanceUser.id)
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId) => {
          return app.channel(`userIds/${userId}`).send({
            channel: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  /**
   * A method used to update channel
   *
   * @param data which is used to update channel
   * @returns updated channel data
   */
  service.publish('patched', async (data): Promise<any> => {
    try {
      let targetIds
      if (data.channelType === 'user') {
        data.user1 = await app.service('user').get(data.userId1)
        data.user2 = await app.service('user').get(data.userId2)
        targetIds = [data.userId1, data.userId2]
      } else if (data.channelType === 'group') {
        if (data.group == null) {
          data.group = await app.service('group').Model.findOne({
            where: {
              id: data.groupId
            }
          })
        }
        const groupUsers = await app.service('group-user').Model.findAll({
          where: {
            groupId: data.groupId
          },
          include: [
            {
              model: app.service('user').Model
            }
          ]
        })

        if (data.group?.dataValues) {
          data.group.dataValues.groupUsers = groupUsers
        } else if (data.group) {
          data.group.groupUsers = groupUsers
        }
        targetIds = groupUsers.map((groupUser) => groupUser.userId)
      } else if (data.channelType === 'party') {
        if (data.party == null) data.party = await app.service('party').Model.findOne({ where: { id: data.partyId } })
        const partyUsers = await app.service('party-user').find({ query: { partyId: data.partyId } })

        if (data.party?.dataValues) data.party.dataValues.party_users = partyUsers.data
        else if (data.party) data.party.party_users = partyUsers.data

        targetIds = partyUsers.data.map((partyUser) => partyUser.userId)
      } else if (data.channelType === 'instance') {
        if (data.instance == null) {
          data.instance = await app.service('instance').Model.findOne({
            where: {
              id: data.instanceId,
              ended: false
            }
          })
        }
        const instanceUsers = await app.service('user').Model.findAll({
          where: {
            instanceId: data.instanceId
          }
        })
        if (data.instance?.dataValues) {
          data.instance.dataValues.instanceUsers = instanceUsers
        } else if (data.instance) {
          data.instance.instanceUsers = instanceUsers
        }
        targetIds = instanceUsers.map((instanceUser) => instanceUser.id)
      }
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
      return Promise.all(
        targetIds.map((userId) => {
          return app.channel(`userIds/${userId}`).send({
            channel: data
          })
        })
      )
    } catch (err) {
      logger.error(err)
      throw err
    }
  })

  /**
   * A method used to remove specific channel
   *
   * @param data which contains userId! and userId2
   * @returns deleted channel data
   */
  service.publish('removed', async (data): Promise<any> => {
    let targetIds
    if (data.channelType === 'user') {
      targetIds = [data.userId1, data.userId2]
    } else if (data.channelType === 'group') {
      const groupUsers = await app.service('group-user').Model.findAll({
        where: {
          groupId: data.groupId
        }
      })
      targetIds = groupUsers.map((groupUser) => groupUser.userId)
    } else if (data.channelType === 'party') {
      const partyUsers = await app.service('party-user').Model.findAll({ where: { partyId: data.partyId } })
      targetIds = partyUsers.map((partyUser) => partyUser.userId)
    } else if (data.channelType === 'instance') {
      const instanceUsers = await app.service('user').Model.findAll({
        where: {
          instanceId: data.instanceId
        }
      })
      targetIds = instanceUsers.map((instanceUser) => instanceUser.id)
    }
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    return Promise.all(
      targetIds.map((userId) => {
        return app.channel(`userIds/${userId}`).send({
          channel: data
        })
      })
    )
  })
}
