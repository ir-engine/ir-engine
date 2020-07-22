import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import { Params } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils'

export class Channel extends Service {
  app: Application
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params: Params): Promise<any> {
    console.log('CHANNEL FIND')
    console.log(params)
    const { query } = params
    const loggedInUser = extractLoggedInUserFromParams(params)
    const userId = loggedInUser.userId
    console.log(query)
    if (query.channelType === 'user') {
      return super.find({
        query: {
          $or: [
            {
              userId1: userId
            },
            {
              userId2: userId
            }
          ],
          $limit: params.query?.$limit ? params.query.$limit : 10,
          $skip: params.query?.$skip ? params.query.$skip : 0,
        }
      })
    }
    else if (query.channelType === 'group') {
      const groupUserResult = await this.app.service('group-user').find({
        query: {
          userId: userId
        }
      })

      const groupIds = (groupUserResult as any).data.map((groupUser) => {
        return groupUser.groupId
      })

      return super.find({
        query: {
          groupId: {
            $in: groupIds
          }
        }
      })
    }
    else if (query.channelType === 'party') {
      const partyUserResult = await this.app.service('group-user').find({
        query: {
          userId: userId
        }
      })

      return super.find({
        query: {
          partyId: (partyUserResult as any).total > 0 ? (partyUserResult as any).data[0].partyId : 'Non-matching partyId'
        }
      })
    }
  }
}
