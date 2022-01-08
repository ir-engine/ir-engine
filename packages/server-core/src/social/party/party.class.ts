import { Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

// import { Params, Id, NullableId } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import { extractLoggedInUserFromParams } from '../../user/auth-management/auth-management.utils'

// import { Forbidden } from '@feathersjs/errors'

/**
 * A class for Party service
 *
 * @author Vyacheslav Solovjov
 */
export class Party extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  // async find(params: Params): Promise<any> {
  //   console.log('params.query', params.query)
  //
  //   const { action, $skip, $limit, ...query} = params.query
  //   const skip = $skip ? params.query.$skip : 0
  //   const limit = $limit ? params.query.$limit : 10
  //   const party = await (this.app.service('party') as any).Model.findAndCountAll({
  //     offset: skip,
  //     limit: limit,
  //     include: [
  //       {
  //         model: (this.app.service('location') as any).Model,
  //         required: false
  //       },
  //       {
  //         model: (this.app.service('instance') as any).Model,
  //         required: false
  //       }
  //     ],
  //     where: query,
  //     raw: true,
  //     nest: true
  //   })
  //   return {
  //     skip: skip,
  //     limit: limit,
  //     total: party.count,
  //     data: party.rows
  //   }
  // }
  /**
   * A function which used to get specific party
   *
   * @param id of specific party
   * @param params contains user info
   * @returns {@Object} of single party
   * @author Vyacheslav Solovjov
   */
  async get(id: string, params: Params): Promise<any> {
    if (id == null) {
      const loggedInUser = extractLoggedInUserFromParams(params)
      const partyUserResult = await this.app.service('party-user').find({
        query: {
          userId: loggedInUser.userId
        }
      })

      if ((partyUserResult as any).total === 0) {
        return null
      }

      const partyId = (partyUserResult as any).data[0].partyId

      const party = await super.get(partyId)

      const partyUsers = await (this.app.service('party-user') as any).Model.findAll({
        where: {
          partyId: party.id
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

      party.partyUsers = partyUsers

      return party
    } else {
      return await super.get(id)
    }
  }
}
