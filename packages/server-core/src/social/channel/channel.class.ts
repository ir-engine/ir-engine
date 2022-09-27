import { Paginated } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import _ from 'lodash'
import { Op } from 'sequelize'

import { Channel as ChannelInterface } from '@xrengine/common/src/interfaces/Channel'
import { UserInterface } from '@xrengine/common/src/interfaces/User'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { UserParams } from '../../user/user/user.class'

export type ChannelDataType = ChannelInterface

export class Channel<T = ChannelDataType> extends Service<T> {
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
   */

  async find(params?: UserParams): Promise<T[] | Paginated<T>> {
    if (!params) params = {}
    const query = params.query!
    const skip = query?.skip || 0
    const limit = query?.limit || 10
    const loggedInUser = params!.user as UserInterface
    const userId = loggedInUser.id
    try {
      const subParams = {
        subQuery: false,
        offset: skip,
        limit: limit,
        order: [['updatedAt', 'DESC']],
        include: [
          'user1',
          'user2',
          {
            model: this.app.service('group').Model,
            include: [
              {
                model: this.app.service('group-user').Model,
                include: [
                  {
                    model: this.app.service('user').Model
                  }
                ]
              }
            ]
          },
          {
            model: this.app.service('party').Model,
            include: [
              {
                model: this.app.service('party-user').Model,
                include: [
                  {
                    model: this.app.service('user').Model
                  }
                ]
              }
            ]
          },
          {
            model: this.app.service('instance').Model,
            include: [
              {
                model: this.app.service('user').Model
              }
            ]
          },
          {
            model: this.app.service('message').Model,
            limit: 20,
            order: [['createdAt', 'DESC']],
            include: [
              {
                model: this.app.service('user').Model,
                as: 'sender'
              }
            ]
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
      }
      if (query.targetObjectType) (subParams.where as any).channelType = query.targetObjectType
      if (query.channelType) (subParams.where as any).channelType = query.channelType
      const results = await this.app.service('channel').Model.findAndCountAll(subParams)

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
        let where

        if (query.instanceId)
          where = {
            channelType: query.channelType,
            instanceId: query.instanceId
          }
        else if (query.partyId)
          where = {
            channelType: query.channelType,
            partyId: query.partyId
          }
        else if (query.groupId)
          where = {
            channelType: query.channelType,
            groupId: query.groupId
          }
        else if (query.friendId)
          where = {
            channelType: query.channelType,
            [Op.or]: [
              {
                userId1: userId,
                userId2: query.friendId
              },
              {
                userId2: userId,
                userId1: query.friendId
              }
            ]
          }
        else
          where = {
            channelType: 'intentionallyBadType'
          }
        return this.app.service('channel').Model.findAll({
          include: params.sequelize.include,
          where: where
        })
      }
    } catch (err) {
      logger.error(err, `Channel find failed: ${err.message}`)
      throw err
    }
  }
}
