import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers/lib/declarations'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { Application } from '../../../declarations'
import { StorageProviderInterface } from '../storageprovider/storageprovider.interface'
import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'
import path from 'path'

/**
 * A class for Managing files in FileBrowser
 *
 * @author Abhishek Pathak
 */

export class FileBrowserService implements ServiceMethods<any> {
  store: StorageProviderInterface

  async setup(app: Application, path: string) {
    this.store = useStorageProvider()
  }

  async find(params?: Params) {}

  /**
   * Return the metadata for each file in a directory
   * @param id
   * @param params
   * @returns
   */
  async get(id: Id, params?: Params): Promise<FileContentType[]> {
    const result = await this.store.listFolderContent(`${id}`)
    return result
  }

  /**
   * Create a directory
   * @param data
   * @param params
   * @returns
   */
  async create(data, params?: Params) {
    return this.store.putObject({ Key: data.fileName, Body: Buffer.alloc(0), ContentType: null })
  }

  /**
   * Move content from one path to another
   * @param id
   * @param data
   * @param params
   * @returns
   */
  async update(from: string, { destination, isCopy, renameTo }, params?: Params) {
    return this.store.moveObject(from, destination, isCopy, renameTo)
  }

  /**
   *
   * @param id
   * @param data
   * @param params
   */
  async patch(id: NullableId, data, params?: Params) {}

  /**
   * Remove a directory
   * @param id
   * @param params
   * @returns
   */
  async remove(path: string, params?: Params) {
    return await this.store.deleteResources([path])
  }
}
