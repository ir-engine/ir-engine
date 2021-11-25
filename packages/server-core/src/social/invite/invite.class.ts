import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Params } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'

/**
 * A class for Invite service
 *
 * @author Vyacheslav Solovjov
 */
export class Invite extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  /**
   * A method which get all invite
   *
   * @param params of query with type and userId
   * @returns invite data
   * @author Vyacheslav Solovjov
   */
  async find(params: Params): Promise<any> {
    const query = params.query!
    if (query.type === 'received') {
      const identityProviders = await this.app.service('identity-provider').find({
        query: {
          userId: query.userId
        }
      })
      const identityProviderTokens = (identityProviders as any).data.map((provider) => provider.token)
      const result = await super.find({
        query: {
          $or: [
            { inviteeId: query.userId },
            {
              token: {
                $in: identityProviderTokens
              }
            }
          ],
          $limit: query.$limit || 10,
          $skip: query.$skip || 0
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
      const result = await super.find({
        query: {
          userId: query.userId,
          $limit: query.$limit || 10,
          $skip: query.$skip || 0
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
    } else {
      return super.find(params)
    }
  }

  async remove(id: string, params: Params): Promise<any> {
    const invite = await this.app.service('invite').get(id)
    if (invite.inviteType === 'friend' && invite.inviteeId != null && !params.preventUserRelationshipRemoval) {
      const selfUser = extractLoggedInUserFromParams(params)
      const relatedUserId = invite.userId === selfUser.userId ? invite.inviteeId : invite.userId
      await this.app.service('user-relationship').remove(relatedUserId, params)
    }
    return super.remove(id)
  }
}
