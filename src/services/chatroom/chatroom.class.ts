import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Op } from 'sequelize'

interface Data {}

interface ServiceOptions {}

export class Chatroom implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  remove (id: NullableId, params?: Params | undefined): Promise<Data | Data[]> {
    throw new Error('Method not implemented.')
  }

  get (id: Id, params?: Params | undefined): Promise<Data> {
    throw new Error('Method not implemented.')
  }

  [key: string]: any
  update (id: NullableId, data: Data, params?: Params | undefined): Promise<Data | Data[]> {
    throw new Error('Method not implemented.')
  }

  patch (id: NullableId, data: Partial<Data>, params?: Params | undefined): Promise<Data | Data[]> {
    throw new Error('Method not implemented.')
  }

  async find (params?: any): Promise<Data[]> {
    const userModel = this.app.service('user').Model
    const userId = params?.connection['identity-provider'].userId
    const conversationModel = this.app.service('conversation').Model
    const messageModel = this.app.service('message').Model
    const messageStatusModel = this.app.service('message-status').Model
    // const groupModel = this.app.service('group').Model
    // const groupUserModel = this.app.service('group-user').Model
    // const partyModel = this.app.service('party').Model

    const chatRooms = await conversationModel.findAll({
      where: {
        [Op.or]: [{ firstuserId: userId }, { seconduserId: userId }],
        type: 'user'
      },
      attributes: ['id', 'type'],
      include: [
        {
          model: messageModel,
          attributes: ['id', 'text', 'senderId', 'createdAt', 'isDelivered', 'isRead'],
          separate: true,
          order: [['id', 'desc']],
          limit: 20,
          offset: 0,
          include: [
            {
              model: messageStatusModel,
              attributes: ['id', 'recipientId', 'isRead', 'isDelivered']
            }
          ]
        },
        {
          model: userModel,
          attributes: ['id', 'name'],
          as: 'firstuser'
        },
        {
          model: userModel,
          attributes: ['id', 'name'],
          as: 'seconduser'
        }
      ]
    })

    return chatRooms
  }

  async create (data: any, params?: Params): Promise<Data> {
    // senderId: data.senderId,
    //     recipientId: data.recipientId,
    //     recipientType: data.recipientType
    const messageModel = this.app.service('message').Model
    const userModel = this.app.service('user').Model

    const message = await messageModel.create({
      text: data.text,
      senderId: data.senderId,
      conversationId: data.conversationId
    })

    const users = await userModel.findAll({
      where: {
        id: {
          [Op.in]: [data.senderId, data.recipientId]
        }
      },
      attributes: ['id', 'name']
    })
    const returnData = {
      conversation: {
        users: users,
        message: [
          {
            id: message.id,
            text: message.text,
            sender: data.senderId
          }
        ]
      },
      sender_id: data.sender_id
    }
    return returnData
  }
}
