import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../declarations'
import { NullableId, Params } from '@feathersjs/feathers'

export class Conversation extends Service {
  app: Application
  constructor (options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async update (id: NullableId, data: any, params?: Params | undefined): Promise<any> {
    const conversationModel = this.app.service('conversation').Model
    const conversation = await conversationModel.findOne({
      where: {
        id: data.conversationId,
        seconduserId: data.userId
      }
    })
    if (conversation) {
      if (data.action) {
        conversation.update({ status: true })
      } else {
        conversationModel.destroy()
      }
    } else {
      throw new Error('Friend request not found.')
    }

    return true
  }
}
