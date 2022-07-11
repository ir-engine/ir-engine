import { Paginated, Params, Query } from '@feathersjs/feathers'
import crypto from 'crypto'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import Sequelize, { Op } from 'sequelize'

import { IdentityProviderInterface } from '@xrengine/common/src/dbmodels/IdentityProvider'
import { Invite as InviteType } from '@xrengine/common/src/interfaces/Invite'
import { UserInterface } from '@xrengine/common/src/interfaces/User'
import { UserId } from '@xrengine/common/src/interfaces/UserId'

import { Application } from '../../../declarations'
import { sendInvite } from '../../hooks/send-invite'
import logger from '../../logger'

export type InviteDataType = InviteType & { targetObjectId: UserId; passcode: string }

const afterInviteFind = async (app: Application, result: Paginated<InviteDataType>) => {
  try {
    await Promise.all(
      result.data.map(async (item) => {
        return await new Promise(async (resolve) => {
          if (item.inviteeId != null) {
            item.invitee = await app.service('user').get(item.inviteeId)
          } else if (item.token) {
            const identityProvider = (await app.service('identity-provider').find({
              query: {
                token: item.token
              }
            })) as Paginated<IdentityProviderInterface>
            if (identityProvider.data.length > 0) {
              item.invitee = await app.service('user').get(identityProvider.data[0].userId)
            }
          }
          item.user = await app.service('user').get(item.userId)

          resolve(true)
        })
      })
    )
  } catch (err) {
    logger.error(err, `INVITE AFTER HOOK ERROR: ${err.message}`)
    return null!
  }
}

export const inviteReceived = async (inviteService: Invite, query) => {
  const identityProviders = await inviteService.app.service('identity-provider').find({
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

  const result = (await Service.prototype.find.call(inviteService, {
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
  })) as Paginated<InviteDataType>

  await Promise.all(
    result.data.map(async (invite) => {
      if (invite.inviteType === 'group') {
        try {
          const group = await inviteService.app.service('group').get(invite.targetObjectId)
          invite.groupName = group.name
        } catch (err) {
          invite.groupName = '<A deleted group>'
        }
      }
    })
  )
  return result
}

export const inviteSent = async (inviteService: Invite, query: Query) => {
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
  const result = (await Service.prototype.find.call(inviteService, {
    query: {
      userId: query.userId,
      ...q,
      $sort: $sort,
      $limit: query.$limit,
      $skip: query.$skip
    }
  })) as Paginated<InviteDataType>

  await Promise.all(
    result.data.map(async (invite) => {
      if (invite.inviteType === 'group') {
        try {
          const group = await inviteService.app.service('group').get(invite.targetObjectId)
          invite.groupName = group.name
        } catch (err) {
          invite.groupName = '<A deleted group>'
        }
      }
    })
  )
  return result
}

/**
 * A class for Invite service
 *
 * @author Vyacheslav Solovjov
 */
export class Invite extends Service<InviteDataType> {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async create(data: any, params?: Params): Promise<InviteDataType | InviteDataType[]> {
    const result = (await super.create(data)) as InviteDataType
    data.passcode = crypto.randomBytes(8).toString('hex')
    await sendInvite(this.app, result, params!)
    return result
  }

  /**
   * A method which get all invite
   *
   * @param params of query with type and userId
   * @returns invite data
   * @author Vyacheslav Solovjov
   */
  async find(params?: Params): Promise<InviteDataType[] | Paginated<InviteDataType>> {
    let result: Paginated<InviteDataType> = null!
    if (params && params.query) {
      const query = params.query
      if (query.type === 'received') {
        result = await inviteReceived(this, query)
      } else if (query.type === 'sent') {
        result = await inviteSent(this, query)
      }
    } else {
      result = (await super.find(params)) as Paginated<InviteDataType>
    }
    await afterInviteFind(this.app, result)
    return result
  }

  async remove(id: string, params?: Params): Promise<InviteDataType> {
    const invite = await this.app.service('invite').get(id)
    if (invite.inviteType === 'friend' && invite.inviteeId != null && !params?.preventUserRelationshipRemoval) {
      const selfUser = params!.user as UserInterface
      const relatedUserId = invite.userId === selfUser.id ? invite.inviteeId : invite.userId
      await this.app.service('user-relationship').remove(relatedUserId, params)
    }
    return (await super.remove(id)) as InviteDataType
  }
}
