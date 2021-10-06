import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers/lib/declarations'
import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'

/**
 * A class for Managing files in FileBrowser
 *
 * @author Abhishek Pathak
 */
export class FileBrowserService implements ServiceMethods<any> {
  public docs: any

  async find(params?: Params) {}
  async get(id: Id, params?: Params): Promise<any> {
    return id
  }
  async create(data, params?: Params) {}
  async update(id: NullableId, data, params?: Params) {}
  async patch(id: NullableId, data, params?: Params) {}
  async remove(id: NullableId, params?: Params) {}

  async setup(app: Application, path: string) {}
}
