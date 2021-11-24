import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Params } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'
import { Op, Sequelize } from 'sequelize'
import _ from 'lodash'
import logger from '../../logger'

export class Channel extends Service {
  app: Application
  docs: any
  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  /**
   * A method which find channel and display it
   *
   * @param params of query which contains items limit and numberr skip
   * @returns {@Array} which contains list of channel
   * @author Vyacheslav Solovjov
   */

  async find(params: Params): Promise<any> {
    const query = params.query!
    const skip = query?.skip || 0
    const limit = query?.limit || 10
    const loggedInUser = extractLoggedInUserFromParams(params)
    const userId = loggedInUser.userId
    const Model = (this.app.service('channel') as any).Model
    try {
      const results = await Model.findAndCountAll({
        subQuery: false,
        offset: skip,
        limit: limit,
        order: [['updatedAt', 'DESC']],
        include: [
          'user1',
          'user2',
          {
            model: (this.app.service('group') as any).Model,
            include: [
              {
                model: (this.app.service('group-user') as any).Model,
                include: [
                  {
                    model: (this.app.service('user') as any).Model
                  }
                ]
              }
            ]
          },
          {
            model: (this.app.service('party') as any).Model,
            include: [
              {
                model: (this.app.service('party-user') as any).Model,
                include: [
                  {
                    model: (this.app.service('user') as any).Model
                  }
                ]
              }
            ]
          },
          {
            model: (this.app.service('instance') as any).Model,
            include: [
              {
                model: (this.app.service('user') as any).Model
              }
            ]
          },
          {
            model: this.app.service('message').Model,
            limit: 20,
            order: [['createdAt', 'DESC']]
          }
        ],
        where: {
          [Op.or]: [
            {
              [Op.or]: [
                {
                  userId1: userId
                },
                {
                  userId2: userId
                }
              ]
            },
            {
              '$group.group_users.userId$': userId
            },
            {
              '$party.party_users.userId$': userId
            },
            {
              '$instance.users.id$': userId
            }
          ]
        }
      })

      if (query.findTargetId === true) {
        const match = _.find(results.rows, (result: any) =>
          query.targetObjectType === 'user'
            ? result.userId1 === query.targetObjectId || result.userId2 === query.targetObjectId
            : query.targetObjectType === 'group'
            ? result.groupId === query.targetObjectId
            : query.targetObjectType === 'instance'
            ? result.instanceId === query.targetObjectId
            : result.partyId === query.targetObjectId
        )
        return {
          data: [match] || [],
          total: match == null ? 0 : 1,
          skip: skip,
          limit: limit
        }
      } else {
        await Promise.all(
          results.rows.map(async (channel) => {
            return await new Promise(async (resolve) => {
              if (channel.channelType === 'user') {
                // const user1AvatarResult = await this.app.service('static-resource').find({
                //   query: {
                //     staticResourceType: 'user-thumbnail',
                //     userId: channel.userId1
                //   }
                // }) as any;
                //
                // const user2AvatarResult = await this.app.service('static-resource').find({
                //   query: {
                //     staticResourceType: 'user-thumbnail',
                //     userId: channel.userId2
                //   }
                // }) as any;
                //
                // if (user1AvatarResult.total > 0) {
                //   channel.user1.dataValues.avatarUrl = user1AvatarResult.data[0].url;
                // }
                //
                // if (user2AvatarResult.total > 0) {
                //   channel.user2.dataValues.avatarUrl = user2AvatarResult.data[0].url;
                // }

                resolve(true)
              } else if (channel.channelType === 'group') {
                const groupUsers = await (this.app.service('group-user') as any).Model.findAll({
                  where: {
                    groupId: channel.groupId
                  },
                  include: [
                    {
                      model: (this.app.service('user') as any).Model
                    }
                  ]
                })
                // await Promise.all(groupUsers.map(async (groupUser) => {
                //   const avatarResult = await this.app.service('static-resource').find({
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

                channel.group.dataValues.groupUsers = groupUsers
                resolve(true)
              } else if (channel.channelType === 'party') {
                const partyUsers = await (this.app.service('party-user') as any).Model.findAll({
                  where: {
                    partyId: channel.partyId
                  },
                  include: [
                    {
                      model: (this.app.service('user') as any).Model
                    }
                  ]
                })
                // await Promise.all(partyUsers.map(async (partyUser) => {
                //   const avatarResult = await this.app.service('static-resource').find({
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
                channel.party.dataValues.partyUsers = partyUsers
                resolve(true)
              } else if (channel.channelType === 'instance') {
                const instanceUsers = await (this.app.service('user') as any).Model.findAll({
                  where: {
                    instanceId: channel.instanceId
                  }
                })
                // await Promise.all(instanceUsers.map(async(user) => {
                //   const avatarResult = await this.app.service('static-resource').find({
                //     query: {
                //       staticResourceType: 'user-thumbnail',
                //       userId: user.id
                //     }
                //   }) as any;
                //
                //   if (avatarResult.total > 0) {
                //     user.dataValues.avatarUrl = avatarResult.data[0].url;
                //   }
                //
                //   return await Promise.resolve();
                // }));
                channel.instance.dataValues.instanceUsers = instanceUsers
                resolve(true)
              }
            })
          })
        )

        if (query.channelType) results.rows = results.rows.filter((row) => row.channelType === query.channelType)
        if (query.groupId) results.rows = results.rows.filter((row) => row.groupId === query.groupId)
        if (query.instanceId) results.rows = results.rows.filter((row) => row.instanceId === query.instanceId)
        if (query.partyId) results.rows = results.rows.filter((row) => row.partyId === query.partyId)

        return {
          data: results.rows,
          total: results.count,
          skip: skip,
          limit: limit
        }
      }
    } catch (err) {
      logger.error('Channel find failed')
      logger.error(err)
      throw err
    }
  }
}
