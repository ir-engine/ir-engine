import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Op } from 'sequelize'
import { Application } from '../../declarations'
import { Params, NullableId } from '@feathersjs/feathers'
import { Forbidden } from '@feathersjs/errors'

export class PartyUser extends Service {
  app: Application
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  // async find (params: Params): Promise<[] | any> {
  //   // Find All users of selected party
  //
  //   const PartyModel = this.app.service('party').Model
  //   const PartyUserModel = this.getModel(params)
  //   const partyUserModelIns = await PartyUserModel.findOne({
  //     where: {
  //       partyId: params?.query?.partyId,
  //       userId: params.user.userId
  //     },
  //     include: [
  //       {
  //         model: PartyModel,
  //         attributes: ['id']
  //       }
  //     ]
  //   })
  //   if (!partyUserModelIns) {
  //     return
  //   }
  //
  //   const partyUsers = await partyUserModelIns.party.getUsers({ attributes: ['email', 'userId', 'id'] })
  //
  //   return partyUsers
  // }
  //
  // async create (data: any, params: Params): Promise<any> {
  //   const PartyModel = this.app.service('party').Model
  //   const PartyUsersModel = this.app.service('party-user').Model
  //
  //   // For now only Admin will add users in party
  //   const party = await PartyModel.findOne({
  //     where: {
  //       id: params?.query?.partyId,
  //       ownerId: params.user.userId
  //     }
  //   })
  //
  //   if (!party) {
  //     return await Promise.reject(new Forbidden('Party not found Or you don\'t have access!'))
  //   }
  //
  //   // We are able to take benefit of using sequelize method *addUser* available due to *many to many* relationShip but
  //   // that was making one extra Query for getting party details Therefore we are doing it manually
  //
  //   const userPartyModel = new PartyUsersModel({
  //     partyId: party.id,
  //     userId: data.userId
  //   })
  //
  //   await userPartyModel.save()
  //
  //   // TODO: After saving party, update contacts via Socket
  //   // TODO: If party is public update to all those users which are in same location
  //   return party
  // }
  //
  // async remove (userIdToRemove: NullableId, params: Params): Promise<any> {
  //   const PartyUserModel = this.getModel(params)
  //   const PartyModel = this.app.service('party').Model
  //   const party = await PartyModel.findOne({
  //     where: {
  //       id: params?.query?.partyId,
  //       ownerId: params.user.userId
  //     }
  //   })
  //
  //   if (!party) {
  //     return await Promise.reject(new Forbidden('Party not found Or you don\'t have access!'))
  //   }
  //
  //   await PartyUserModel.destroy({
  //     where: {
  //       userId: userIdToRemove,
  //       partyId: party.id
  //     }
  //   })
  //
  //   await this.makeOtherUserAsOwner(userIdToRemove, party, PartyUserModel)
  //   return party
  // }
  //
  // private async makeOtherUserAsOwner (userIdToRemove: NullableId, party: any, PartyUserModel: any): Promise<any> {
  //   const promises = []
  //
  //   if (userIdToRemove === party.ownerId) {
  //     // If owner try to remove himself, then randomly make owner to someone else in that party
  //
  //     const otherPartyUser = await PartyUserModel.findOne({
  //       where: {
  //         partyId: party.id,
  //         // isMuted: false,
  //         // isInviteAccepted: true,
  //         userId: { [Op.ne]: userIdToRemove }
  //       }
  //     })
  //
  //     // Fetched some other user, make that as owner of the party now!
  //     if (otherPartyUser) {
  //       promises.push(otherPartyUser.update({ isOwner: true }))
  //       promises.push(party.update({ ownerId: otherPartyUser.userId }))
  //     } else {
  //       // No one is left on party, destory the party
  //       promises.push(party.destory())
  //     }
  //   }
  //
  //   return await Promise.all(promises)
  // }
}
