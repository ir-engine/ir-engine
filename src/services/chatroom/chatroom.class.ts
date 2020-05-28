import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import { Op } from 'sequelize'

interface Data {}

interface ServiceOptions {}

export class Chatroom implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions
  events: string[]

  constructor (options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
    this.events = ['userStatus', 'party']
  }

  remove (id: NullableId, params?: Params | undefined): Promise<Data | Data[]> {
    throw new Error('Method not implemented.')
  }

  get (id: Id, params?: Params | undefined): Promise<Data> {
    throw new Error('Method not implemented.')
  }

  async update (id: NullableId, data: any, params?: Params | undefined): Promise<any> {
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

    const chatRooms = await conversationModel.findAll({
      where: {
        [Op.or]: [{ firstuserId: userId }, { seconduserId: userId }],
        type: 'user',
        status: true
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
    throw new Error('Method not implemented.')
  }
}
