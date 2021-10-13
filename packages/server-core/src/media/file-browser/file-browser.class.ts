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
    return this.store.createDirectory(data.fileName)
  }
  async update(id: NullableId, data, params?: Params) {
    if (id || data.destination) {
      const result = await this.store.moveContent(id as string, data.destination, data.isCopy)
      return result
    }
    return false
  }
  async patch(id: NullableId, data, params?: Params) {}
  async remove(id, params?: Params) {
    return await this.store.deleteContent(id, params.query.type)
  }

  async setup(app: Application, path: string) {}
}
