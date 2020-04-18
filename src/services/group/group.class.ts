import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Params, Id, NullableId } from '@feathersjs/feathers'

import { Application } from '../../declarations'
import { Forbidden } from '@feathersjs/errors'

export class Group extends Service {
  app: Application;

  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find (params: Params): Promise<[]> {
    const groupMembersModel = this.app.service('group-member').Model

    const groups = await groupMembersModel.findAll({
      where: {
        userId: params.user.userId
      },
      attributes: [['groupId', 'id'], 'isMuted', 'isOwner'],
      include: [
        {
          model: this.getModel(params),
          attributes: ['isPublic']
        }
      ]
    })

    return groups
  }

  async get (id: Id, params: Params): Promise<any> {
    const groupMembersModel = this.app.service('group-member').Model

    const group = await groupMembersModel.findOne({
      where: {
        groupId: id,
        userId: params.user.userId
      },
      attributes: [['groupId', 'id'], 'isMuted', 'isOwner'],
      include: [
        {
          model: this.getModel(params),
          attributes: ['isPublic']
        }
      ]
    })

    if (!group) {
      return await Promise.reject(new Forbidden('Group not found Or you don\'t have access!'))
    }
    return group
  }

  async create (data: any, params: Params): Promise<any> {
    const GroupMembersModel = this.app.service('group-member').Model
    const GroupModel = this.getModel(params)
    let savedGroup = new GroupModel(data)
    savedGroup = await savedGroup.save()

    // We are able to take benefit of using sequelize method *addUser* available due to *many to many* relationShip but
    // that was making one extra Query for getting group details Therefore we are doing it manually
    const userGroupModel = new GroupMembersModel({
      groupId: savedGroup.id,
      userId: params.user.userId,
      isOwner: true,
      isInviteAccepted: true
    })
    await userGroupModel.save()
    // TODO: After saving group, update contacts via Socket
    // TODO: If group is public update to all those users which are in same location
    return savedGroup
  }

  async patch (id: NullableId, data: any, params?: Params): Promise<any> {
    // TODO: Handle socket update
    return await super.patch(id, data, params)
  }
}
