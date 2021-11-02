import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers/lib/declarations'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { Application } from '../../../declarations'
import { StorageProviderInterface } from '../storageprovider/storageprovider.interface'
import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

interface PatchParams {
  body: Buffer
  contentType: string
}

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
  async get(directory: string, params?: Params): Promise<FileContentType[]> {
    if (directory.substr(0, 1) === '/') directory = directory.slice(1) // remove leading slash
    const result = await this.store.listFolderContent(directory)
    return result
  }

  /**
   * Create a directory
   * @param directory
   * @param params
   * @returns
   */
  async create(directory, params?: Params) {
    if (directory.substr(0, 1) === '/') directory = directory.slice(1) // remove leading slash
    return this.store.putObject({ Key: directory + '/', Body: Buffer.alloc(0), ContentType: 'application/x-empty' })
  }

  /**
   * Move content from one path to another
   * @param id
   * @param data
   * @param params
   * @returns
   */
  async update(from: string, { destination, isCopy, renameTo }, params?: Params) {
    // TODO
    throw new Error('[File Browser]: Temporarily disabled for instability. - TODO')
    return this.store.moveObject(from, destination, isCopy, renameTo)
  }

  /**
   * Upload file
   * @param id
   * @param data
   * @param params
   */
  async patch(path: string, data: PatchParams, params?: Params) {
    return await this.store.putObject({
      Key: path,
      Body: data.body,
      ContentType: data.contentType
    })
  }

  /**
   * Remove a directory
   * @param id
   * @param params
   * @returns
   */
  async remove(path: string, params?: Params) {
    const dirs = await this.store.listObjects(path + '/', true)
    return await this.store.deleteResources([path, ...dirs.Contents.map((a) => a.Key)])
  }
}
