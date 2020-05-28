import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'

export class MessageStatus extends Service {
  app: Application
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async update (type: any, data: any): Promise<any> {
    console.log('message update called')
    const messageModel = this.app.service('message').Model
    const messageStatusModel = this.app.service('message-status').Model
    const messages = await messageModel.findAll({
      where: {
        conversationId: data.conversationId,
        [type]: false
      },
      include: [
        {
          model: messageStatusModel,
          attributes: ['id', 'recipientId', 'isDelivered', 'isRead'],
          where: {
            [type]: false,
            recipientId: data.recipientId
          }
        }
      ]
    })
    const promises: any[] = []
    if (messages.length) {
      messages.forEach((item: any) => {
        if (item.message_statuses.length) {
          const recipientMessageStatus = item.message_statuses[0]
          promises.push(messageStatusModel.update(
            {
              [type]: true
            },
            {
              where: {
                id: recipientMessageStatus.id
              }
            }
          ))
        }
      })
    }

    return await Promise.all(promises)
  }
}
