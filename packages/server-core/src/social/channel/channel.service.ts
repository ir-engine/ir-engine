import { Application } from '../../../declarations'
import { Channel } from './channel.class'
import createModel from './channel.model'
import hooks from './channel.hooks'
import logger from '../../logger'
import channelDocs from './channel.docs'

// Add this service to the service type index
declare module '../../../declarations' {
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
   *
   * @author Vyacheslav Solovjov
   */
  const event = new Channel(options, app)
  event.docs = channelDocs
  app.use('channel', event)

  const service = app.service('channel')

  service.hooks(hooks)

  /**
   * A method which is used to create channel
   *
   * @param data which is parsed to create channel
   * @returns created channel data
   * @author Vyacheslav Solovjov
   */
  service.publish('created', async (data): Promise<any> => {
    try {
      let targetIds
      if (data.channelType === 'user') {
        data.user1 = await app.service('user').get(data.userId1)
        data.user2 = await app.service('user').get(data.userId2)
        // const user1AvatarResult = await app.service('static-resource').find({
        //   query: {
        //     staticResourceType: 'user-thumbnail',
        //     userId: data.userId1
        //   }
        // }) as any;
        //
        // const user2AvatarResult = await app.service('static-resource').find({
        //   query: {
        //     staticResourceType: 'user-thumbnail',
        //     userId: data.userId2
        //   }
        // }) as any;
        //
        // if (user1AvatarResult.total > 0) {
        //   data.user1.dataValues.avatarUrl = user1AvatarResult.data[0].url;
        // }
        //
        // if (user2AvatarResult.total > 0) {
        //   data.user2.dataValues.avatarUrl = user2AvatarResult.data[0].url;
        // }
        targetIds = []
      } else if (data.channelType === 'group') {
        if (data.group == null) {
          data.group = await (app.service('group') as any).Model.findOne({
            where: {
              id: data.groupId
            }
          })
        }
        const groupUsers = await (app.service('group-user') as any).Model.findAll({
          where: {
            groupId: data.groupId
          },
          include: [
            {
              model: (app.service('user') as any).Model
            }
          ]
        })
        // await Promise.all(groupUsers.map(async (groupUser) => {
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

        if (data.group?.dataValues) {
          data.group.dataValues.groupUsers = groupUsers
        } else if (data.group) {
          data.group.groupUsers = groupUsers
        }
        targetIds = groupUsers.map((groupUser) => groupUser.userId)
      } else if (data.channelType === 'party') {
        if (data.party == null) {
          data.party = await (app.service('party') as any).Model.findOne({
            where: {
              id: data.partyId
            }
          })
        }
        const partyUsers = await (app.service('party-user') as any).Model.findAll({
          where: {
            partyId: data.partyId
          },
          include: [
            {
              model: (app.service('user') as any).Model
            }
          ]
        })
        // await Promise.all(partyUsers.map(async (partyUser) => {
        //   const avatarResult = await app.service('static-resource').find({
        //     query: {
        //       staticResourceType: 'user-thumbnail',
        //       userId: partyUser.userId
        //     }
        //   }) as any;
        //
        //   if (avatarResult.total > 0) {
        //     partyUser.dataValues.user.dataValues.avatarUrl = avatarResult.data[0].url;
        //   }
        //
        //   return await Promise.resolve();
        // }));
        if (data.party?.dataValues) {
          data.party.dataValues.partyUsers = partyUsers
        } else if (data.party) {
          data.party.partyUsers = partyUsers
        }
        targetIds = partyUsers.map((partyUser) => partyUser.userId)
      } else if (data.channelType === 'instance') {
        if (data.instance == null) {
          data.instance = await (app.service('instance') as any).Model.findOne({
            where: {
              id: data.instanceId,
              ended: false
            }
          })
        }
        const instanceUsers = await (app.service('user') as any).Model.findAll({
          where: {
            instanceId: data.instanceId
          }
        })
        // await Promise.all(instanceUsers.map(async (instanceUser) => {
        //   const avatarResult = await app.service('static-resource').find({
        //     query: {
        //       staticResourceType: 'user-thumbnail',
        //       userId: instanceUser.id
        //     }
        //   }) as any;
        //
        //   if (avatarResult.total > 0) {
        //     instanceUser.dataValues.avatarUrl = avatarResult.data[0].url;
        //   }
        //
        //   return await Promise.resolve();
        // }));
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
   * @author Vyacheslav Solovjov
   */
  service.publish('patched', async (data): Promise<any> => {
    try {
      let targetIds
      if (data.channelType === 'user') {
        data.user1 = await app.service('user').get(data.userId1)
        data.user2 = await app.service('user').get(data.userId2)
        // const user1AvatarResult = await app.service('static-resource').find({
        //   query: {
        //     staticResourceType: 'user-thumbnail',
        //     userId: data.userId1
        //   }
        // }) as any;
        //
        // const user2AvatarResult = await app.service('static-resource').find({
        //   query: {
        //     staticResourceType: 'user-thumbnail',
        //     userId: data.userId2
        //   }
        // }) as any;
        //
        // if (user1AvatarResult.total > 0) {
        //   data.user1.dataValues.avatarUrl = user1AvatarResult.data[0].url;
        // }
        //
        // if (user2AvatarResult.total > 0) {
        //   data.user2.dataValues.avatarUrl = user2AvatarResult.data[0].url;
        // }
        targetIds = [data.userId1, data.userId2]
      } else if (data.channelType === 'group') {
        if (data.group == null) {
          data.group = await (app.service('group') as any).Model.findOne({
            where: {
              id: data.groupId
            }
          })
        }
        const groupUsers = await (app.service('group-user') as any).Model.findAll({
          where: {
            groupId: data.groupId
          },
          include: [
            {
              model: (app.service('user') as any).Model
            }
          ]
        })
        // await Promise.all(groupUsers.map(async (groupUser) => {
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

        if (data.group?.dataValues) {
          data.group.dataValues.groupUsers = groupUsers
        } else if (data.group) {
          data.group.groupUsers = groupUsers
        }
        targetIds = groupUsers.map((groupUser) => groupUser.userId)
      } else if (data.channelType === 'party') {
        if (data.party == null) {
          data.party = await (app.service('party') as any).Model.findOne({
            where: {
              id: data.partyId
            }
          })
        }
        const partyUsers = await (app.service('party-user') as any).Model.findAll({
          where: {
            partyId: data.partyId
          },
          include: [
            {
              model: (app.service('user') as any).Model
            }
          ]
        })
        // await Promise.all(partyUsers.map(async (partyUser) => {
        //   const avatarResult = await app.service('static-resource').find({
        //     query: {
        //       staticResourceType: 'user-thumbnail',
        //       userId: partyUser.userId
        //     }
        //   }) as any;
        //
        //   if (avatarResult.total > 0) {
        //     partyUser.dataValues.user.dataValues.avatarUrl = avatarResult.data[0].url;
        //   }
        //
        //   return await Promise.resolve();
        // }));
        if (data.party?.dataValues) {
          data.party.dataValues.partyUsers = partyUsers
        } else if (data.party) {
          data.party.partyUsers = partyUsers
        }
        targetIds = partyUsers.map((partyUser) => partyUser.userId)
      } else if (data.channelType === 'instance') {
        if (data.instance == null) {
          data.instance = await (app.service('instance') as any).Model.findOne({
            where: {
              id: data.instanceId,
              ended: false
            }
          })
        }
        const instanceUsers = await (app.service('user') as any).Model.findAll({
          where: {
            instanceId: data.instanceId
          }
        })
        // await Promise.all(instanceUsers.map(async (instanceUser) => {
        //   const avatarResult = await app.service('static-resource').find({
        //     query: {
        //       staticResourceType: 'user-thumbnail',
        //       userId: instanceUser.id
        //     }
        //   }) as any;
        //
        //   if (avatarResult.total > 0) {
        //     instanceUser.dataValues.avatarUrl = avatarResult.data[0].url;
        //   }
        //
        //   return await Promise.resolve();
        // }));
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
   * @author Vyacheslav Solovjov
   */
  service.publish('removed', async (data): Promise<any> => {
    let targetIds
    if (data.channelType === 'user') {
      targetIds = [data.userId1, data.userId2]
    } else if (data.channelType === 'group') {
      const groupUsers = await (app.service('group-user') as any).Model.findAll({
        where: {
          groupId: data.groupId
        }
      })
      targetIds = groupUsers.map((groupUser) => groupUser.userId)
    } else if (data.channelType === 'party') {
      const partyUsers = await (app.service('party-user') as any).Model.findAll({
        where: {
          partyId: data.partyId
        }
      })
      targetIds = partyUsers.map((partyUser) => partyUser.userId)
    } else if (data.channelType === 'instance') {
      const instanceUsers = await (app.service('user') as any).Model.findAll({
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
