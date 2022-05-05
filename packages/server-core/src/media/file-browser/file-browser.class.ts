import { NullableId, Params, ServiceMethods } from '@feathersjs/feathers/lib/declarations'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path/posix'

import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

import { Application } from '../../../declarations'
import { copyRecursiveSync, getIncrementalName } from '../FileUtil'
import { getCachedAsset } from '../storageprovider/getCachedAsset'
import { useStorageProvider } from '../storageprovider/storageprovider'
import { StorageObjectInterface, StorageProviderInterface } from '../storageprovider/storageprovider.interface'

export const projectsRootFolder = path.join(appRootPath.path, 'packages/projects')

type UpdateParamsType = {
  oldName: string
  newName: string
  oldPath: string
  newPath: string
  isCopy?: boolean
}

interface PatchParams {
  path: string
  fileName: string
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
  app: Application

  constructor(app: Application) {
    this.app = app
  }

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

    const parentPath = path.dirname(directory)
    const key = await getIncrementalName(path.basename(directory), parentPath, this.store, true)

    const result = await this.store.putObject({ Key: path.join(parentPath, key) } as StorageObjectInterface, {
      isDirectory: true
    })

    fs.mkdirSync(path.join(projectsRootFolder, parentPath, key))

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
    const _oldPath = data.oldPath[0] === '/' ? data.oldPath.substring(1) : data.oldPath
    const _newPath = data.newPath[0] === '/' ? data.newPath.substring(1) : data.newPath

    const isDirectory = await this.store.isDirectory(data.oldName, _oldPath)
    const fileName = await getIncrementalName(data.newName, _newPath, this.store, isDirectory)
    const result = await this.store.moveObject(data.oldName, fileName, _oldPath, _newPath, data.isCopy)

    const oldNamePath = path.join(projectsRootFolder, _oldPath, data.oldName)
    const newNamePath = path.join(projectsRootFolder, _newPath, fileName)

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
  async patch(_id: NullableId, data: PatchParams, params?: Params) {
    const key = path.join(data.path[0] === '/' ? data.path.substring(1) : data.path, data.fileName)

    await this.store.putObject(
      {
        Key: key,
        Body: data.body,
        ContentType: data.contentType
      },
      {
        isDirectory: false
      }
    )

    fs.writeFileSync(path.join(projectsRootFolder, key), data.body)

    return getCachedAsset(key, this.store.cacheDomain, params && params.provider == null)
  }

  /**
   * Remove a directory
   * @param id
   * @param params
   * @returns
   */
  async remove(key: string, _params?: Params) {
    const dirs = await this.store.listObjects(key, true)
    const result = await this.store.deleteResources([key, ...dirs.Contents.map((a) => a.Key)])

    const filePath = path.join(projectsRootFolder, key)
    if (fs.lstatSync(filePath).isDirectory()) {
      fs.rmSync(filePath, { force: true, recursive: true })
    } else {
      fs.unlinkSync(filePath)
    }

    const staticResource = await this.app.service('static-resource').find({
      where: {
        key: key,
        $limit: 1
      }
    })
    staticResource?.data?.length > 0 && (await this.app.service('static-resource').remove(staticResource?.data[0]?.id))

    return result
  }
}
