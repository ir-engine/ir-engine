import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers/lib/declarations'
import { StorageProvider } from '../..'
import { Application } from '../../../declarations'

/**
 * A class for Managing files in FileBrowser
 *
 * @author Abhishek Pathak
 */
export class FileBrowserService implements ServiceMethods<any> {
  store = new StorageProvider()

  async find(params?: Params) {}

  async get(id: Id, params?: Params): Promise<any> {
    const result = await this.store.listFolderContent(`${id}`)
    return result
  }
  async create(data, params?: Params) {
    console.log('Data is:' + JSON.stringify(data))
  }
  async update(id: NullableId, data, params?: Params) {}
  async patch(id: NullableId, data, params?: Params) {}
  async remove(id: NullableId, params?: Params) {}

  async setup(app: Application, path: string) {}
}
