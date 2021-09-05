import { Id, Params } from '@feathersjs/feathers/lib/declarations'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'

/**
 * A class for Static Resource URL service
 *
 * @author Abhishek Pathak
 */
export class StaticResourceURL extends Service {
  public docs: any
  app: Application

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  async get(id: Id, params?: Params): Promise<{}> {
    const collection = this.app.get('sequelizeClient').models.static_resource.findOne({
      where: {
        id: id
      },
      attributes: ['url']
    })
    return collection
  }
}
