import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import {
  Params
} from '@feathersjs/feathers'

export class Invite extends Service {
  app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find (params: Params): Promise<any> {
    const query = params.query
    if (query.type === 'received') {
      const identityProviders = await this.app.service('identity-provider').find({
        query: {
          userId: query.userId
        }
      })
      console.log(identityProviders)
      let identityProviderTokens = (identityProviders as any).data.map((provider) => provider.token)
      console.log(identityProviderTokens)
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

      console.log(result)

      await Promise.all((result as any).data.map(async (invite) => {
        if (invite.inviteType === 'group') {
          const group = await this.app.service('group').get(invite.targetObjectId)
          invite.groupName = group.name
        }
        return
      }))

      console.log('RESULT WITH GROUPNAME ADDED:')
      console.log(result)

      return result
    }
    else {
      return super.find({
        query: {
          userId: query.userId,
          $limit: query.$limit || 10,
          $skip: query.$skip || 0
        }
      })
    }
  }
}
