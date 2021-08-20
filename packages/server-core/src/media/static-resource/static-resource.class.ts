import { Params } from '@feathersjs/feathers'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'

/**
 * A class for Static Resource  service
 *
 * @author Vyacheslav Solovjov
 */
export class StaticResource extends Service {
  public docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
  }

  async create(data, params?: Params): Promise<any> {
    const oldResource = await this.find({
      query: {
        $select: ['id'],
        url: data.url
      }
    })

    if ((oldResource as any).total > 0) {
      return this.Model.update(data, {
        where: { url: data.url }
      })
    } else {
      return this.Model.create(data)
    }
  }
}
