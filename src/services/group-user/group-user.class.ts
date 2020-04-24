import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Op } from 'sequelize'
import { Application } from '../../declarations'
import { Params, NullableId } from '@feathersjs/feathers'
import { Forbidden } from '@feathersjs/errors'

export class GroupUser extends Service {
  app: Application
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find (params: Params): Promise<[] | any> {
    // Find All users of selected group

    const GroupModel = this.app.service('group').Model
    const GroupUserModel = this.getModel(params)
    const groupUserModelIns = await GroupUserModel.findOne({
      where: {
        groupId: params?.query?.groupId,
        userId: params.user.userId
      },
      include: [
        {
          model: GroupModel,
          attributes: ['id']
        }
      ]
    })
    if (!groupUserModelIns) {
      return
    }

    const groupUsers = await groupUserModelIns.group.getUsers({ attributes: ['email', 'userId', 'id'] })

    return groupUsers
  }

  async create (data: any, params: Params): Promise<any> {
    const GroupModel = this.app.service('group').Model
    const GroupUsersModel = this.app.service('group-user').Model

    // For now only Admin will add users in group
    const group = await GroupModel.findOne({
      where: {
        id: params?.query?.groupId,
        ownerId: params.user.userId
      }
    })

    if (!group) {
      return await Promise.reject(new Forbidden('Group not found Or you don\'t have access!'))
    }

    // We are able to take benefit of using sequelize method *addUser* available due to *many to many* relationShip but
    // that was making one extra Query for getting group details Therefore we are doing it manually

    const userGroupModel = new GroupUsersModel({
      groupId: group.id,
      userId: data.userId
    })

    await userGroupModel.save()

    // TODO: After saving group, update contacts via Socket
    // TODO: If group is public update to all those users which are in same location
    return group
  }

  async remove (userIdToRemove: NullableId, params: Params): Promise<any> {
    const GroupUserModel = this.getModel(params)
    const GroupModel = this.app.service('group').Model
    const group = await GroupModel.findOne({
      where: {
        id: params?.query?.groupId,
        ownerId: params.user.userId
      }
    })

    if (!group) {
      return await Promise.reject(new Forbidden('Group not found Or you don\'t have access!'))
    }

    await GroupUserModel.destroy({
      where: {
        userId: userIdToRemove,
        groupId: group.id
      }
    })

    await this.makeOtherUserAsOwner(userIdToRemove, group, GroupUserModel)
    return group
  }

  private async makeOtherUserAsOwner (userIdToRemove: NullableId, group: any, GroupUserModel: any): Promise<any> {
    const promises = []

    if (userIdToRemove === group.ownerId) {
      // If owner try to remove himself, then randomly make owner to someone else in that group

      const otherGroupUser = await GroupUserModel.findOne({
        where: {
          groupId: group.id,
          // isMuted: false,
          // isInviteAccepted: true,
          userId: { [Op.ne]: userIdToRemove }
        }
      })

      // Fetched some other user, make that as owner of the group now!
      if (otherGroupUser) {
        promises.push(otherGroupUser.update({ isOwner: true }))
        promises.push(group.update({ ownerId: otherGroupUser.userId }))
      } else {
        // No one is left on group, destory the group
        promises.push(group.destory())
      }
    }

    return await Promise.all(promises)
  }
}
