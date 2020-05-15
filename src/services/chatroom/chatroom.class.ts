import { Id, NullableId, Paginated, Params, ServiceMethods } from '@feathersjs/feathers'
import { Application } from '../../declarations'
import sequelize from 'sequelize'

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

  async find (params?: any): Promise<Data[] | Paginated<Data>> {
    console.log(params)
    // const userModel = this.app.service('user').Model
    // const query = 'SELECT t1.sender_id, t1.recipient_id , t2.text FROM ' +
    // ' conversation t1 INNER JOIN messages t2 ON t1.id = t2.conversationId ORDER BY t2.createdAt DESC'
    // const [result] = await this.app.get('sequelizeClient').query(query)
    const conversationModel = this.app.service('conversation').Model
    const result = await conversationModel.findAll({
      where: {
        sender_id: params?.connection['identity-provider'].userId
      },
      include: [{
        model: this.app.service('messages').Model
      }]
    })
    return result
  }

  async create (data: any, params?: Params): Promise<Data> {
    // senderId: data.senderId,
    //     recipientId: data.recipientId,
    //     recipientType: data.recipientType
    const messagesModel = this.app.service('messages').Model
    const messageStatusModel = this.app.service('message-status').Model
    const userModel = this.app.service('user').Model

    const message = await messagesModel.create({
      text: data.text,
      senderId: data.senderId,
      conversationId: data.conversationId
    })

    messageStatusModel.create({
      messageId: message.id,
      recipientId: data.recipientId
    })
    const users = await userModel.findAll({
      where: {
        id: {
          [sequelize.Op.in]: [data.senderId, data.recipientId]
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
