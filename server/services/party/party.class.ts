import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
// import { Params, Id, NullableId } from '@feathersjs/feathers'

import { Application } from '../../declarations'
import { Params } from '@feathersjs/feathers'
import { extractLoggedInUserFromParams } from '../auth-management/auth-management.utils'
// import { Forbidden } from '@feathersjs/errors'

export class Party extends Service {
  app: Application

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async get (id: string | null, params?: Params): Promise<any> {
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

      let party = await super.get(partyId)

      const partyUsers = await this.app.service('party-user').Model.findAll({
        limit: 1000,
        where: {
          partyId: party.id
        },
        include: [
          {
            model: this.app.service('user').Model
          }
        ]
      })
      await Promise.all(partyUsers.map(async (partyUser) => {
        const avatarResult = await this.app.service('static-resource').find({
          query: {
            staticResourceType: 'user-thumbnail',
            userId: partyUser.userId
          }
        }) as any

        if (avatarResult.total > 0) {
          partyUser.dataValues.user.dataValues.avatarUrl = avatarResult.data[0].url
        }

        return await Promise.resolve()
      }))

      console.log('Setting partyUsers:')
      console.log(party)
      party.partyUsers = partyUsers

      console.log('Returning party:')
      console.log(party)
      return party
    } else {
      return await super.get(id)
    }
  }

  // async find (params: Params): Promise<[]> {
  //   const partyUsersModel = this.app.service('party-user').Model

  //   const partys = await partyUsersModel.findAll({
  //     where: {
  //       userId: params.user.userId
  //     },
  //     attributes: [['partyId', 'id'], 'isMuted', 'isOwner'],
  //     include: [
  //       {
  //         model: this.getModel(params)
  //       }
  //     ]
  //   })

  //   return partys
  // }

  // async get (id: Id, params: Params): Promise<any> {
  //   const partyUsersModel = this.app.service('party-user').Model

  //   const party = await partyUsersModel.findOne({
  //     where: {
  //       partyId: id,
  //       userId: params.user.userId
  //     },
  //     attributes: ['partyId', 'isMuted', 'isOwner'],
  //     include: [{ model: this.getModel(params) }]
  //   })

  //   if (!party) {
  //     return await Promise.reject(new Forbidden('Party not found Or you don\'t have access!'))
  //   }
  //   return party
  // }

  // async create (data: any, params: Params): Promise<any> {
  //   const PartyUsersModel = this.app.service('party-user').Model
  //   const PartyModel = this.getModel(params)
  //   let savedGroup = new PartyModel(data)
  //   savedGroup = await savedGroup.save()

  //   // We are able to take benefit of using sequelize method *addUser* available due to *many to many* relationShip but
  //   // that was making one extra Query for getting party details Therefore we are doing it manually
  //   const userPartyModel = new PartyUsersModel({
  //     partyId: savedGroup.id,
  //     userId: params.user.userId,
  //     isOwner: true,
  //     isInviteAccepted: true
  //   })
  //   await userPartyModel.save()
  //   // TODO: After saving party, update contacts via Socket
  //   // TODO: If party is public update to all those users which are in same location
  //   return savedGroup
  // }

  // async patch (id: NullableId, data: any, params?: Params): Promise<any> {
  //   // TODO: Handle socket update
  //   return await super.patch(id, data, params)
  // }
}
