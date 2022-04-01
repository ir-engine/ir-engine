import { NullableId, Params, ServiceMethods } from '@feathersjs/feathers/lib/declarations'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path/posix'

import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

import { copyRecursiveSync, getIncrementalName } from '../FileUtil'
import { getCachedAsset } from '../storageprovider/getCachedAsset'
import { useStorageProvider } from '../storageprovider/storageprovider'
import { StorageProviderInterface } from '../storageprovider/storageprovider.interface'

const storageProvider = useStorageProvider()
const projectsRootFolder = path.join(appRootPath.path, 'packages/projects')

type UpdateParamsType = {
  oldName: string
  newName: string
  oldPath: string
  newPath: string
  isCopy?: boolean
}

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

  async setup(_app, _path: string): Promise<void> {
    this.store = useStorageProvider()
  }

  async find(_params?: Params) {}

  /**
   * Return the metadata for each file in a directory
   * @param id
   * @param params
   * @returns
   */
  async get(directory: string, _params?: Params): Promise<FileContentType[]> {
    if (directory[0] === '/') directory = directory.slice(1) // remove leading slash
    const result = await this.store.listFolderContent(directory)
    return result
  }

  /**
   * Create a directory
   * @param directory
   * @param params
   * @returns
   */
  async create(directory) {
    if (directory[0] === '/') directory = directory.slice(1) // remove leading slash
    const result = await this.store.putObject({
      Key: directory + '/',
      Body: Buffer.alloc(0),
      ContentType: 'application/x-empty'
    })

    fs.mkdirSync(path.join(projectsRootFolder, directory))

    return result
  }

  /**
   * Move content from one path to another
   * @param id
   * @param data
   * @param params
   * @returns
   */
  async update(_id: NullableId, data: UpdateParamsType, _params?: Params) {
    const result = await this.store.moveObject(
      path.join(data.oldPath, data.oldName),
      data.newPath,
      data.isCopy,
      data.newName
    )

    const newParentPath = path.join(projectsRootFolder, data.newPath)
    const fileName = getIncrementalName(data.newName, newParentPath)
    const oldNamePath = path.join(projectsRootFolder, data.oldPath, data.oldName)
    const newNamePath = path.join(newParentPath, fileName)

    if (data.isCopy) {
      copyRecursiveSync(oldNamePath, newNamePath)
    } else {
      fs.renameSync(oldNamePath, newNamePath)
    }

    return result
  }

  /**
   * Upload file
   * @param id
   * @param data
   * @param params
   */
  async patch(key: string, data: PatchParams, params?: Params) {
    await this.store.putObject({
      Key: key,
      Body: data.body,
      ContentType: data.contentType
    })

    fs.writeFileSync(path.join(projectsRootFolder, key), data.body)

    return getCachedAsset(key, storageProvider.cacheDomain, params && params.provider == null)
  }

  /**
   * Remove a directory
   * @param id
   * @param params
   * @returns
   */
  async remove(key: string, _params?: Params) {
    const dirs = await this.store.listObjects(key + '/', [], true, null!)
    const result = await this.store.deleteResources([key, ...dirs.Contents.map((a) => a.Key)])

    const filePath = path.join(projectsRootFolder, key)
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { force: true, recursive: true })
    } else {
      fs.unlinkSync(filePath)
    }

    return result
  }
}
