import { Forbidden } from '@feathersjs/errors'
import { NullableId, Params, ServiceMethods } from '@feathersjs/feathers/lib/declarations'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path/posix'

import { FileContentType } from '@xrengine/common/src/interfaces/FileContentType'

import { Application } from '../../../declarations'
import { copyRecursiveSync, getIncrementalName } from '../FileUtil'
import { getCacheDomain } from '../storageprovider/getCacheDomain'
import { getCachedURL } from '../storageprovider/getCachedURL'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { StorageObjectInterface } from '../storageprovider/storageprovider.interface'

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
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  async setup(app: Application, path: string) {}
  async find(_params?: Params) {}

  /**
   * Return the metadata for each file in a directory
   * @param directory
   * @param params
   * @returns
   */
  async get(directory: string, params?: Params): Promise<FileContentType[]> {
    const storageProvider = getStorageProvider()
    const isAdmin = params?.user && params.user.userRole === 'admin'
    if (directory[0] === '/') directory = directory.slice(1) // remove leading slash
    if (params?.provider && !isAdmin && directory !== '' && !/^projects/.test(directory))
      throw new Forbidden('Not allowed to access that directory')
    let result = await storageProvider.listFolderContent(directory)

    if (params?.provider && !isAdmin) {
      const projectPermissions = await this.app.service('project-permission').Model.findAll({
        include: ['project'],
        where: {
          userId: params?.user.id
        }
      })
      const allowedProjectNames = projectPermissions.map((permission) => permission.project.name)
      result = result.filter((item) => {
        const projectRegexExec = /projects\/(.+)$/.exec(item.key)
        const subFileRegexExec = /projects\/(.+)\//.exec(item.key)
        return (
          (subFileRegexExec && allowedProjectNames.indexOf(subFileRegexExec[1]) > -1) ||
          (projectRegexExec && allowedProjectNames.indexOf(projectRegexExec[1]) > -1) ||
          item.name === 'projects'
        )
      })
    }
    return result
  }

  /**
   * Create a directory
   * @param directory
   * @returns
   */
  async create(directory) {
    const storageProvider = getStorageProvider()
    if (directory[0] === '/') directory = directory.slice(1) // remove leading slash

    const parentPath = path.dirname(directory)
    const key = await getIncrementalName(path.basename(directory), parentPath, storageProvider, true)

    const result = await storageProvider.putObject({ Key: path.join(parentPath, key) } as StorageObjectInterface, {
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
  async update(id: NullableId, data: UpdateParamsType, params?: Params) {
    const storageProvider = getStorageProvider()
    const _oldPath = data.oldPath[0] === '/' ? data.oldPath.substring(1) : data.oldPath
    const _newPath = data.newPath[0] === '/' ? data.newPath.substring(1) : data.newPath

    const isDirectory = await storageProvider.isDirectory(data.oldName, _oldPath)
    const fileName = await getIncrementalName(data.newName, _newPath, storageProvider, isDirectory)
    const result = await storageProvider.moveObject(data.oldName, fileName, _oldPath, _newPath, data.isCopy)

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
  async patch(id: NullableId, data: PatchParams, params?: Params) {
    const storageProvider = getStorageProvider()
    const key = path.join(data.path[0] === '/' ? data.path.substring(1) : data.path, data.fileName)

    await storageProvider.putObject(
      {
        Key: key,
        Body: data.body,
        ContentType: data.contentType
      },
      {
        isDirectory: false
      }
    )

    const filePath = path.join(projectsRootFolder, key)
    const parentDirPath = path.dirname(filePath)

    if (!fs.existsSync(parentDirPath)) fs.mkdirSync(parentDirPath, { recursive: true })
    fs.writeFileSync(filePath, data.body)

    const cacheDomain = getCacheDomain(storageProvider, params && params.provider == null)
    return getCachedURL(key, cacheDomain)
  }

  /**
   * Remove a directory
   * @param key
   * @param params
   * @returns
   */
  async remove(key: string, params?: Params) {
    const storageProvider = getStorageProvider()
    const dirs = await storageProvider.listObjects(key, true)
    const result = await storageProvider.deleteResources([key, ...dirs.Contents.map((a) => a.Key)])

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
