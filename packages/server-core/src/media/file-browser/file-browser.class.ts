/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/ir-engine/ir-engine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Infinite Reality Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Infinite Reality Engine team.

All portions of the code written by the Infinite Reality Engine team are Copyright © 2021-2023 
Infinite Reality Engine. All Rights Reserved.
*/

import { NullableId, Paginated, ServiceInterface } from '@feathersjs/feathers/lib/declarations'
import { KnexAdapterParams } from '@feathersjs/knex'
import appRootPath from 'app-root-path'
import fs from 'fs'
import { Knex } from 'knex'
import path from 'path/posix'

import { projectPath, ProjectType, staticResourcePath } from '@ir-engine/common/src/schema.type.module'
import {
  FileBrowserContentType,
  FileBrowserPatch,
  FileBrowserUpdate
} from '@ir-engine/common/src/schemas/media/file-browser.schema'
import { invalidationPath } from '@ir-engine/common/src/schemas/media/invalidation.schema'
import { StaticResourceType } from '@ir-engine/common/src/schemas/media/static-resource.schema'
import {
  projectPermissionPath,
  ProjectPermissionType
} from '@ir-engine/common/src/schemas/projects/project-permission.schema'
import { checkScope } from '@ir-engine/common/src/utils/checkScope'
import { isValidFileExtension, isValidFileName, isValidFilePath } from '@ir-engine/common/src/utils/validateFileName'
import isValidSceneName from '@ir-engine/common/src/utils/validateSceneName'

import { BadRequest } from '@feathersjs/errors/lib'
import { PROJECT_CAPTURE_REGEX, PROJECT_REGEX } from '@ir-engine/common/src/regex'
import { copyFolderRecursiveSync } from '@ir-engine/common/src/utils/fsHelperFunctions'
import { Application } from '../../../declarations'
import config from '../../appconfig'
import verifyProjectPermission from '../../hooks/verify-project-permission'
import { getContentType } from '../../util/fileUtils'
import { getIncrementalName } from '../FileUtil'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { StorageObjectInterface, StorageProviderInterface } from '../storageprovider/storageprovider.interface'
import { uploadStaticResource } from './file-helper'

export const projectsRootFolder = path.join(appRootPath.path, 'packages/projects')

export interface FileBrowserParams extends KnexAdapterParams {}

const ensureProjectsDirectory = (directory: string) => {
  const resolvedDirectory = path.join(directory)
  if (!resolvedDirectory.startsWith('projects'))
    throw new Error(`Not allowed to access directory "${resolvedDirectory}"`)
}

const ensureProjectPermissionAndPublicOrAssetsDirectory = async (
  inputPath: string,
  projectName: string,
  app: Application,
  params: FileBrowserParams
) => {
  if (!PROJECT_REGEX.test(inputPath)) throw new BadRequest('Invalid path: ' + inputPath + '; not in a valid project')
  const pathSplit = inputPath.split('/')
  const fileNameSplit = pathSplit[pathSplit.length - 1].split('.')
  const isDirectory = fileNameSplit.length === 1
  const filePath = path.join(...pathSplit.slice(0, isDirectory ? pathSplit.length : pathSplit.length - 1))
  if (!isValidFilePath(filePath))
    throw new BadRequest(
      'Invalid path: ' +
        filePath +
        '; directories can only contain alphanumeric characters, dashes, underscores, dots, and @'
    )
  if (!isDirectory) {
    if (!isValidFileName(fileNameSplit[0]))
      throw new BadRequest(
        'Invalid file name: ' +
          fileNameSplit[0] +
          '; file names must be 4-64 characters, start and end with an alphanumeric, and contain only alphanumerics, dashes, underscores, and dots'
      )
    if (!isValidFileExtension(fileNameSplit[1]))
      throw new BadRequest(
        'Invalid file extension: ' + fileNameSplit[1] + '; file extension must be 2-4 alphanumeric characters'
      )
  }

  await verifyProjectPermission(['owner', 'editor'])({
    data: {
      project: projectName
    },
    params,
    app: app
  } as any)

  const resolvedPath = path.resolve(inputPath)
  const resolvedProjectPath = path.resolve('projects', projectName)
  const publicRegExp = new RegExp(`^${resolvedProjectPath}/public/`)
  const assetsRegExp = new RegExp(`^${resolvedProjectPath}/assets/`)

  if (!publicRegExp.test(resolvedPath) && !assetsRegExp.test(resolvedPath))
    throw new Error(
      'Not allowed to access this directory or file: ' +
        path.join(inputPath) +
        ' as it does not match the specified project: ' +
        projectName +
        ' or it is not in the public or assets folder'
    )
}

/**
 * A class for File Browser service
 */
export class FileBrowserService
  implements
    ServiceInterface<
      boolean | StaticResourceType | Paginated<FileBrowserContentType>,
      string | FileBrowserUpdate | FileBrowserPatch,
      FileBrowserParams,
      FileBrowserPatch
    >
{
  app: Application

  constructor(app: Application) {
    this.app = app
  }

  /**
   * Returns the metadata for a single file or directory
   */
  async get(key: string, params?: FileBrowserParams) {
    key = decodeURIComponent(key)
    if (!key) return false
    const storageProvider = getStorageProvider()
    let [_, directory, file] = /(.*)\/([^\\\/]+$)/.exec(key)!
    if (directory[0] === '/') directory = directory.slice(1)

    ensureProjectsDirectory(directory)

    const joinedDirectory = path.join(key)
    const projectRegexExec = PROJECT_CAPTURE_REGEX.exec(joinedDirectory)
    if (!projectRegexExec || projectRegexExec.length < 3)
      throw new BadRequest('Invalid project path: ' + joinedDirectory)
    const projectName = `${projectRegexExec[1]}/${projectRegexExec[2]}`

    await ensureProjectPermissionAndPublicOrAssetsDirectory(key, projectName, this.app, params!)

    return await storageProvider.doesExist(file, directory)
  }

  /**
   * Return the metadata for each file in a directory
   */
  async find(params?: FileBrowserParams) {
    if (!params) params = {}
    if (!params.query) params.query = {}
    const { $skip, $limit } = params.query
    let { directory } = params.query

    const skip = $skip ? $skip : 0
    const limit = $limit ? $limit : 100

    const storageProvider = getStorageProvider()
    const isAdmin = params.user && (await checkScope(params.user, 'admin', 'admin'))
    if (directory[0] === '/') directory = directory.slice(1)

    ensureProjectsDirectory(directory)

    let result = await storageProvider.listFolderContent(directory)
    Object.entries(params.query).forEach(([key, value]) => {
      if (value['$like']) {
        result = result.filter(
          (item) =>
            (item[key] as string).search(new RegExp((value['$like'] as string).replaceAll('%', ''), 'gi')) !== -1
        )
      }
    })

    let total = result.length

    result = result.slice(skip, skip + limit)

    if (params.provider && !isAdmin) {
      const knexClient: Knex = this.app.get('knexClient')
      const projectPermissions: { 'project-permission': ProjectPermissionType; project: ProjectType }[] =
        await knexClient
          .from(projectPermissionPath)
          .join(projectPath, `${projectPermissionPath}.projectId`, `${projectPath}.id`)
          .where(`${projectPermissionPath}.userId`, params.user!.id)
          .select()
          .options({ nestTables: true })

      if (directory === 'projects/') {
        total = projectPermissions.length
      }

      const allowedProjectNames = projectPermissions.map((permission) => permission.project.name)
      const filtered = result.filter((item) => {
        return (
          allowedProjectNames.some((project) => item.key.startsWith(`projects/${project}`)) || item.name === 'projects'
        )
      })
      total = total - (result.length - filtered.length)
      result = filtered
    }

    const resourceQuery = (await this.app.service(staticResourcePath).find({
      query: {
        key: { $in: result.map((file) => file.key) }
      },
      paginate: false
    })) as unknown as StaticResourceType[]
    const resourceMap: Record<string, StaticResourceType> = {}
    for (const resource of resourceQuery) {
      resourceMap[resource.key] = resource
    }
    for (const file of result) {
      const resource = resourceMap[file.key]
      if (resource) {
        file.url = resource.url
        file.thumbnailURL = resource.thumbnailURL
      } else file.url = storageProvider.getCachedURL(file.key, params.isInternal)
    }

    return {
      total,
      limit,
      skip,
      data: result
    }
  }

  /**
   * Create a directory
   */
  async create(directory: string, params?: FileBrowserParams) {
    const storageProvider = getStorageProvider(params?.query?.storageProviderName)
    if (directory[0] === '/') directory = directory.slice(1)

    ensureProjectsDirectory(directory)

    const joinedDirectory = path.join(directory)
    const projectRegexExec = PROJECT_CAPTURE_REGEX.exec(joinedDirectory)
    if (!projectRegexExec || projectRegexExec.length < 3)
      throw new BadRequest('Invalid project path: ' + joinedDirectory)
    const projectName = `${projectRegexExec[1]}/${projectRegexExec[2]}`

    await ensureProjectPermissionAndPublicOrAssetsDirectory(directory, projectName, this.app, params!)

    if (!isValidFilePath(joinedDirectory))
      throw new BadRequest(
        'Invalid directory: ' +
          joinedDirectory +
          '; directories can only contain alphanumeric characters, dashes, underscores, dots, and @'
      )

    const parentPath = path.dirname(directory)
    const key = await getIncrementalName(path.basename(directory), parentPath, storageProvider, true)
    const keyPath = path.join(parentPath, key)

    const result = await storageProvider.putObject({ Key: keyPath } as StorageObjectInterface, {
      isDirectory: true
    })

    if (config.fsProjectSyncEnabled) fs.mkdirSync(path.resolve(projectsRootFolder, keyPath), { recursive: true })

    if (config.server.edgeCachingEnabled)
      await this.app.service(invalidationPath).create({
        path: keyPath
      })

    return result
  }

  /**
   * Move content from one path to another
   */
  async update(id: NullableId, data: FileBrowserUpdate, params?: FileBrowserParams) {
    const storageProviderName = data.storageProviderName
    delete data.storageProviderName
    const storageProvider = getStorageProvider(storageProviderName)

    await ensureProjectPermissionAndPublicOrAssetsDirectory(
      path.join(data.oldPath, data.oldName),
      data.oldProject,
      this.app,
      params!
    )

    await ensureProjectPermissionAndPublicOrAssetsDirectory(
      path.join(data.newPath, data.newName),
      data.newProject,
      this.app,
      params!
    )

    /** @todo future proofing for when projects include orgname */
    if (!data.oldPath.startsWith('projects/' + data.oldProject))
      throw new Error(
        'Not allowed to access this directory: ' +
          data.oldPath +
          ' as it does not match specified project ' +
          data.oldProject
      )
    if (!data.newPath.startsWith('projects/' + data.newProject))
      throw new Error(
        'Not allowed to access this directory: ' +
          data.newPath +
          ' as it does not match specified project ' +
          data.newProject
      )

    const oldDirectory = data.oldPath.endsWith('/')
      ? data.oldPath.split('/').slice(0, -1).join('/')
      : data.oldPath.split('/').join('/')
    const newDirectory = data.newPath.endsWith('/')
      ? data.newPath.split('/').slice(0, -1).join('/')
      : data.newPath.split('/').join('/')
    const oldName = data.oldName.endsWith('/') ? data.oldName.slice(0, -1) : data.oldName
    const newName = data.newName.endsWith('/') ? data.newName.slice(0, -1) : data.newName

    const isDirectory = await storageProvider.isDirectory(oldName, oldDirectory)
    const fileName = await getIncrementalName(newName, newDirectory, storageProvider, isDirectory)
    if (isDirectory) {
      await this.moveFolderRecursively(
        storageProvider,
        path.join(oldDirectory, oldName),
        path.join(newDirectory, fileName),
        !!data?.isCopy
      )
    } else {
      await storageProvider.moveObject(oldName, fileName, oldDirectory, newDirectory, data.isCopy)
    }

    const staticResources = (await this.app.service(staticResourcePath).find({
      query: {
        key: { $like: `%${path.join(oldDirectory, oldName)}%` },
        paginate: false
      } as any
    })) as unknown as StaticResourceType[]

    const results = [] as StaticResourceType[]
    for (const resource of staticResources) {
      const newKey = resource.key.replace(path.join(oldDirectory, oldName), path.join(newDirectory, fileName))

      if (data.isCopy) {
        const result = await this.app.service(staticResourcePath).create(
          {
            key: newKey,
            hash: resource.hash,
            mimeType: resource.mimeType,
            project: data.newProject,
            stats: resource.stats,
            type: resource.type,
            tags: resource.tags,
            dependencies: resource.dependencies,
            licensing: resource.licensing,
            description: resource.description,
            attribution: resource.attribution,
            thumbnailKey: resource.thumbnailKey,
            thumbnailMode: resource.thumbnailMode
          },
          { isInternal: true }
        )
        results.push(result)
      } else {
        const result = await this.app.service(staticResourcePath).patch(
          resource.id,
          {
            key: newKey
          },
          { isInternal: true }
        )
        results.push(result)
      }
    }

    if (config.fsProjectSyncEnabled) {
      const oldNamePath = path.join(projectsRootFolder, oldDirectory, oldName)
      const newNamePath = path.join(projectsRootFolder, newDirectory, fileName)
      // ensure the directory exists
      if (!fs.existsSync(path.dirname(newNamePath))) {
        const dirname = path.dirname(newNamePath)
        fs.mkdirSync(dirname, { recursive: true })
      }
      // move or copy the file
      if (data.isCopy) {
        if (isDirectory) {
          copyFolderRecursiveSync(oldNamePath, newNamePath)
        } else {
          fs.copyFileSync(oldNamePath, newNamePath)
        }
      } else fs.renameSync(oldNamePath, newNamePath)
    }

    if (config.server.edgeCachingEnabled) {
      await this.app.service(invalidationPath).create(staticResources.map((resource) => ({ path: resource.key })))
    }

    return results
  }

  private async moveFolderRecursively(
    storageProvider: StorageProviderInterface,
    oldPath: string,
    newPath: string,
    isCopy: boolean
  ) {
    const items = await storageProvider.listFolderContent(oldPath + '/')

    for (const item of items) {
      const oldItemPath = path.join(oldPath, item.name)
      const newItemPath = path.join(newPath, item.name)

      if (item.type === 'directory') {
        await this.moveFolderRecursively(storageProvider, oldItemPath, newItemPath, isCopy)
      } else {
        //The local storage provider requires the file extension because it interacts with the filesystem and needs the full path, including the extension.
        const fileName = config.server.storageProvider === 'local' ? `${item.name}.${item.type}` : item.name
        await storageProvider.moveObject(fileName, fileName, oldPath, newPath, isCopy)
      }
    }

    // move the folder itself
    await storageProvider.moveObject(
      path.basename(oldPath),
      path.basename(newPath),
      path.dirname(oldPath),
      path.dirname(newPath),
      isCopy
    )
  }

  /**
   * Upload file
   */
  async patch(id: NullableId, data: FileBrowserPatch, params?: FileBrowserParams) {
    await ensureProjectPermissionAndPublicOrAssetsDirectory(
      path.join('projects', data.project, data.path),
      data.project,
      this.app,
      params!
    )

    if (typeof data.body === 'string') {
      const url = new URL(data.body)
      try {
        const response = await fetch(url)
        const arr = await response.arrayBuffer()
        data.body = Buffer.from(arr)
      } catch (error) {
        throw new Error('Failure in fetching source URL: ' + url + 'Error: ' + error)
      }
    }

    if (data.type === 'scene') validateSceneName(data.path)

    let key = path.join('projects', data.project, data.path)
    if (data.unique) key = await ensureUniqueName(this.app, key)

    /** @todo should we allow user-specific content types? Or standardize on the backend? */
    const contentType = data.contentType ?? getContentType(key)

    const existingResourceQuery = (await this.app.service(staticResourcePath).find({
      query: { key }
    })) as Paginated<StaticResourceType>
    const existingResource = existingResourceQuery.data.length ? existingResourceQuery.data[0] : undefined

    const staticResource = await uploadStaticResource(this.app, {
      ...data,
      key,
      contentType,
      id: existingResource?.id
    })

    if (config.fsProjectSyncEnabled) {
      const filePath = path.resolve(projectsRootFolder, key)
      const dirname = path.dirname(filePath)
      fs.mkdirSync(dirname, { recursive: true })
      fs.writeFileSync(filePath, data.body)
    }

    if (config.server.edgeCachingEnabled) {
      await this.app.service(invalidationPath).create([{ path: staticResource.key }])
    }

    return staticResource
  }

  /**
   * Remove a directory
   */
  async remove(key: string, params?: FileBrowserParams) {
    const storageProviderName = params?.query?.storageProviderName
    if (storageProviderName) delete params.query?.storageProviderName

    key = decodeURIComponent(key)
    ensureProjectsDirectory(key)

    const joinedDirectory = path.join(key)
    const projectRegexExec = PROJECT_CAPTURE_REGEX.exec(joinedDirectory)
    if (!projectRegexExec || projectRegexExec.length < 3)
      throw new BadRequest('Invalid project path: ' + joinedDirectory)
    const projectName = `${projectRegexExec[1]}/${projectRegexExec[2]}`

    await ensureProjectPermissionAndPublicOrAssetsDirectory(key, projectName, this.app, params!)

    const storageProvider = getStorageProvider(storageProviderName)
    const dirs = await storageProvider.listObjects(joinedDirectory, true)
    const result = await storageProvider.deleteResources([joinedDirectory, ...dirs.Contents.map((a) => a.Key)])

    const staticResources = (await this.app.service(staticResourcePath).find({
      query: {
        key: { $like: `%${joinedDirectory}%` }
      },
      paginate: false
    })) as StaticResourceType[]

    if (staticResources?.length > 0) {
      await Promise.all(
        staticResources.map(async (resource) => {
          await this.app.service(staticResourcePath).remove(resource.id)
          if (resource.thumbnailKey) {
            const thumbnail = (await this.app.service(staticResourcePath).find({
              query: { key: { $like: `%${resource.thumbnailKey}%` }, type: 'thumbnail' },
              paginate: false
            })) as any as StaticResourceType[]

            if (thumbnail.length > 0) {
              await storageProvider.deleteResources([thumbnail[0].key])
              await this.app.service(staticResourcePath).remove(thumbnail[0].id)
            }
          }
        })
      )
    }

    if (config.fsProjectSyncEnabled) fs.rmSync(path.resolve(projectsRootFolder, key), { recursive: true })

    if (config.server.edgeCachingEnabled)
      await this.app.service(invalidationPath).create({
        path: key
      })

    return result
  }
}

export const validateSceneName = async (key: string) => {
  const assetName = key.split('/').at(-1)?.split('.').at(0)
  if (!isValidSceneName(assetName ?? '')) {
    throw new BadRequest('scene name is invalid')
  }
}

export const ensureUniqueName = async (app: Application, key: string) => {
  const fileName = key.split('/').pop()!

  const cleanedFileNameWithoutExtension = fileName.split('.').slice(0, -1).join('.')
  const fileExtension = fileName.split('/').pop()!.split('.').pop()
  const fileDirectory = key!.split('/').slice(0, -1).join('/') + '/'
  let counter = 0
  let name = cleanedFileNameWithoutExtension + '.' + fileExtension

  const storageProvider = getStorageProvider()

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (counter > 0) name = cleanedFileNameWithoutExtension + '-' + counter + '.' + fileExtension
    const sceneNameExists = await storageProvider.doesExist(name, fileDirectory)
    if (!sceneNameExists) break
    counter++
  }

  return fileDirectory + name
}
