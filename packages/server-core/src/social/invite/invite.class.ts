import { Paginated, Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import Sequelize, { Op } from 'sequelize'

import { Invite as InviteType } from '@xrengine/common/src/interfaces/Invite'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Application } from '../../../declarations'
import { UserDataType } from '../../user/user/user.class'

export type InviteDataType = InviteType & { targetObjectId: UserId; passcode: string }

/**
 * A class for Invite service
 *
 * @author Vyacheslav Solovjov
 */
export class Invite<T = InviteDataType> extends Service<T> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async create(data: any): Promise<T | T[]> {
    return super.create(data)
  }

  /**
   * A method which get all invite
   *
   * @param params of query with type and userId
   * @returns invite data
   * @author Vyacheslav Solovjov
   */
  async find(params?: Params): Promise<T[] | Paginated<T>> {
    if (params && params.query) {
      const query = params.query
      if (query.type === 'received') {
        const identityProviders = await this.app.service('identity-provider').find({
          query: {
            userId: query.userId
          }
        })
        const identityProviderTokens = (identityProviders as any).data.map((provider) => provider.token)

        const { $sort, search } = query

        let q = {} as any

        if (search) {
          q = {
            [Op.or]: [
              Sequelize.where(Sequelize.fn('lower', Sequelize.col('inviteType')), {
                [Op.like]: '%' + search.toLowerCase() + '%'
              }),
              Sequelize.where(Sequelize.fn('lower', Sequelize.col('passcode')), {
                [Op.like]: '%' + search.toLowerCase() + '%'
              })
            ]
          }
        }

        const result = await super.find({
          query: {
            inviteeId: query.userId,
            token: {
              $in: identityProviderTokens
            },
            ...q,
            $sort: $sort,
            $limit: query.$limit,
            $skip: query.$skip
          }
        })

        await Promise.all(
          (result as any).data.map(async (invite) => {
            if (invite.inviteType === 'group') {
              try {
                const group = await this.app.service('group').get(invite.targetObjectId)
                invite.groupName = group.name
              } catch (err) {
                invite.groupName = '<A deleted group>'
              }
            }
          })
        )

        return result
      } else if (query.type === 'sent') {
        const { $sort, search } = query
        let q = {}

        if (search) {
          q = {
            [Op.or]: [
              Sequelize.where(Sequelize.fn('lower', Sequelize.col('inviteType')), {
                [Op.like]: '%' + search.toLowerCase() + '%'
              }),
              Sequelize.where(Sequelize.fn('lower', Sequelize.col('passcode')), {
                [Op.like]: '%' + search.toLowerCase() + '%'
              })
            ]
          }
        }
        const result = await super.find({
          query: {
            userId: query.userId,
            ...q,
            $sort: $sort,
            $limit: query.$limit,
            $skip: query.$skip
          }
        })

        await Promise.all(
          (result as any).data.map(async (invite) => {
            if (invite.inviteType === 'group') {
              try {
                const group = await this.app.service('group').get(invite.targetObjectId)
                invite.groupName = group.name
              } catch (err) {
                invite.groupName = '<A deleted group>'
              }
            }
          })
        )

        return result
      }
    }
    return super.find(params)
  }

  async remove(id: string, params?: Params): Promise<T> {
    const invite = await this.app.service('invite').get(id)
    if (invite.inviteType === 'friend' && invite.inviteeId != null && !params?.preventUserRelationshipRemoval) {
      const selfUser = params!.user as UserDataType
      const relatedUserId = invite.userId === selfUser.id ? invite.inviteeId : invite.userId
      await this.app.service('user-relationship').remove(relatedUserId, params)
    }
    return (await super.remove(id)) as T
  }
}
