import { Params } from '@feathersjs/feathers'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'

import { Application } from '../../../declarations'

export class Bot extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async find(params: Params): Promise<any> {
    const bots = await (this.app.service('bot') as any).Model.findAll({
      include: [
        {
          model: (this.app.service('bot-command') as any).Model
        },
        {
          model: (this.app.service('location') as any).Model
        },
        {
          model: (this.app.service('instance') as any).Model
        }
      ]
    })
    return {
      data: bots
    }
  }
}
