import { Id, Params } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import fs from 'fs'
import path from 'path'

import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { isDev } from '@xrengine/common/src/utils/isDev'
import templateProjectJson from '@xrengine/projects/template-project/package.json'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../logger'
import { getCachedAsset } from '../../media/storageprovider/getCachedAsset'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'
import { cleanString } from '../../util/cleanString'
import { getContentType } from '../../util/fileUtils'
import { copyFolderRecursiveSync, deleteFolderRecursive, getFilesRecursive } from '../../util/fsHelperFunctions'
import { getGitData } from '../../util/getGitData'
import { useGit } from '../../util/gitHelperFunctions'
import { getAuthenticatedRepo } from '../githubapp/githubapp-helper'
import { getProjectConfig, onProjectEvent } from './project-helper'

const templateFolderDirectory = path.join(appRootPath.path, `packages/projects/template-project/`)

const projectsRootFolder = path.join(appRootPath.path, 'packages/projects/projects/')

export const copyDefaultProject = () => {
  deleteFolderRecursive(path.join(projectsRootFolder, `default-project`))
  copyFolderRecursiveSync(path.join(appRootPath.path, 'packages/projects/default-project'), projectsRootFolder)
}

const getRemoteURLFromGitData = (project) => {
  const data = getGitData(path.resolve(__dirname, `../../../../projects/projects/${project}/.git/config`))
  if (!data?.remote) return null
  return data.remote.origin.url
}

const storageProvider = useStorageProvider()
export const getStorageProviderPath = (projectName: string) =>
  `https://${storageProvider.cacheDomain}/projects/${projectName}/`

export const deleteProjectFilesInStorageProvider = async (projectName: string) => {
  try {
    const existingFiles = await getFileKeysRecursive(`projects/${projectName}`)
    if (existingFiles.length) {
      await Promise.all([
        storageProvider.deleteResources(existingFiles),
        storageProvider.createInvalidation([`projects/${projectName}*`])
      ])
    }
  } catch (e) {}
}

/**
 * Updates the local storage provider with the project's current files
 * @param projectName
 */
export const uploadLocalProjectToProvider = async (projectName, remove = true) => {
  // remove exiting storage provider files
  logger.info(`uploadLocalProjectToProvider for project "${projectName}" started at "${new Date()}".`)
  if (remove) {
    await deleteProjectFilesInStorageProvider(projectName)
  }
  // upload new files to storage provider
  const projectPath = path.resolve(projectsRootFolder, projectName)
  const files = getFilesRecursive(projectPath)
  const results = await Promise.all(
    files
      .filter((file) => !file.includes(`projects/${projectName}/.git/`))
      .map((file: string) => {
        return new Promise(async (resolve) => {
          try {
            const fileResult = fs.readFileSync(file)
            const filePathRelative = file.slice(projectPath.length)
            await storageProvider.putObject({
              Body: fileResult,
              ContentType: getContentType(file),
              Key: `projects/${projectName}${filePathRelative}`
            })
            resolve(getCachedAsset(`projects/${projectName}${filePathRelative}`, storageProvider.cacheDomain, true))
          } catch (e) {
            logger.error(e)
            resolve(null)
          }
        })
      })
  )
  logger.info(`uploadLocalProjectToProvider for project "${projectName}" ended at "${new Date()}".`)
  return results.filter((success) => !!success) as string[]
}

export class Project extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app

    this.app.isSetup.then(() => this._callOnLoad())
  }

  async _callOnLoad() {
    const projects = (
      (await super.find({
        query: { $select: ['name'] }
      })) as any
    ).data as Array<{ name }>
    await Promise.all(
      projects.map(async ({ name }) => {
        const config = await getProjectConfig(name)
        if (config.onEvent) return onProjectEvent(this.app, name, config.onEvent, 'onLoad')
      })
    )
  }

  async _seedProject(projectName: string): Promise<any> {
    logger.warn('[Projects]: Found new locally installed project: ' + projectName)
    const projectConfig = (await getProjectConfig(projectName)) ?? {}
    await super.create({
      thumbnail: projectConfig.thumbnail,
      name: projectName,
      storageProviderPath: getStorageProviderPath(projectName),
      repositoryPath: getRemoteURLFromGitData(projectName)
    })
    // run project install script
    if (projectConfig.onEvent) {
      return onProjectEvent(this.app, projectName, projectConfig.onEvent, 'onInstall')
    }

    return Promise.resolve()
  }

  /**
   * On dev, sync the db with any projects installed locally
   */
  async _fetchDevLocalProjects() {
    const dbEntries = (await super.find()) as any
    const data: ProjectInterface[] = dbEntries.data

    if (!fs.existsSync(projectsRootFolder)) {
      fs.mkdirSync(projectsRootFolder, { recursive: true })
    }

    const locallyInstalledProjects = fs
      .readdirSync(projectsRootFolder, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    const promises: Promise<any>[] = []

    for (const projectName of locallyInstalledProjects) {
      if (!data.find((e) => e.name === projectName)) {
        try {
          promises.push(this._seedProject(projectName))
        } catch (e) {
          logger.error(e)
        }
      }

      promises.push(uploadLocalProjectToProvider(projectName))
    }

    await Promise.all(promises)
    await this._callOnLoad()

    for (const { name, id } of data) {
      if (!locallyInstalledProjects.includes(name)) {
        await deleteProjectFilesInStorageProvider(name)
        logger.warn(`[Projects]: Project ${name} not found, assuming removed`)
        await super.remove(id)
      }
    }
  }

  async create(data: { name: string }, params?: Params) {
    const projectName = cleanString(data.name)

    if (fs.existsSync(path.resolve(projectsRootFolder, projectName)))
      throw new Error(`[Projects]: Project with name ${projectName} already exists`)

    if ((!config.db.forceRefresh && projectName === 'default-project') || projectName === 'template-project')
      throw new Error(`[Projects]: Project name ${projectName} not allowed`)

    const projectLocalDirectory = path.resolve(projectsRootFolder, projectName)

    copyFolderRecursiveSync(templateFolderDirectory, projectsRootFolder)
    fs.renameSync(path.resolve(projectsRootFolder, 'template-project'), path.resolve(projectsRootFolder, projectName))

    fs.mkdirSync(path.resolve(projectLocalDirectory, '.git'), { recursive: true })

    const git = useGit(path.resolve(projectLocalDirectory, '.git'))
    try {
      await git.init(true)
    } catch (e) {
      logger.warn(e)
    }

    const packageData = Object.assign({}, templateProjectJson) as any
    packageData.name = projectName
    fs.writeFileSync(path.resolve(projectLocalDirectory, 'package.json'), JSON.stringify(packageData, null, 2))

    return super.create(
      {
        thumbnail: packageData.thumbnail,
        name: projectName,
        storageProviderPath: getStorageProviderPath(projectName),
        repositoryPath: null
      },
      params
    )
  }

  /**
   * 1. Clones the repo to the local FS
   * 2. If in production mode, uploads it to the storage provider
   * 3. Creates a database entry
   * @param app
   * @returns
   */
  // @ts-ignore
  async update(data: { url: string }, params?: Params) {
    if (data.url === 'default-project') {
      copyDefaultProject()
      await uploadLocalProjectToProvider('default-project', true)
      return
    }

    const urlParts = data.url.split('/')
    let projectName = urlParts.pop()
    if (!projectName) throw new Error('Git repo must be plain URL')
    if (projectName.substring(projectName.length - 4) === '.git') projectName = projectName.slice(0, -4)
    if (projectName.substring(projectName.length - 1) === '/') projectName = projectName.slice(0, -1)

    const projectLocalDirectory = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}/`)

    // remove existing files in fs
    if (fs.existsSync(projectLocalDirectory)) {
      // disable accidental deletion of projects for local development
      if (isDev) throw new Error('Cannot create project - already exists')
      deleteFolderRecursive(projectLocalDirectory)
    }

    let repoPath = await getAuthenticatedRepo(data.url)
    if (!repoPath) repoPath = data.url //public repo

    const git = useGit()
    await git.clone(repoPath, projectLocalDirectory)

    await uploadLocalProjectToProvider(projectName)

    const projectConfig = (await getProjectConfig(projectName)) ?? {}

    // when we have successfully re-installed the project, remove the database entry if it already exists
    const existingProjectResult = await this.Model.findOne({
      where: {
        name: projectName
      }
    })
    if (existingProjectResult != null) await super.remove(existingProjectResult.id, params || {})
    // Add to DB
    const returned = await super.create(
      {
        thumbnail: projectConfig.thumbnail,
        name: projectName,
        storageProviderPath: getStorageProviderPath(projectName),
        repositoryPath: data.url
      },
      params || {}
    )

    // run project install script
    if (projectConfig.onEvent) {
      await onProjectEvent(this.app, projectName, projectConfig.onEvent, 'onInstall')
    }

    return returned
  }

  /**
   * downloads file from storage provider to project
   *   OR
   * uploads project to the storage provider
   * @param projectName The name of the project
   * @param data The names of the files in the project
   * @returns
   */
  async patch(projectName: string, data: { files: string[] }, params?: Params) {
    const projectConfig = await getProjectConfig(projectName)
    if (!projectConfig) return

    // run project uninstall script
    if (projectConfig.onEvent) {
      await onProjectEvent(this.app, projectName, projectConfig.onEvent, 'onUpdate')
    }

    if (data?.files?.length) {
      const promises: Promise<any>[] = []
      for (const filePath of data.files) {
        promises.push(
          new Promise<string>(async (resolve) => {
            const fileResult = await storageProvider.getObject(filePath)
            const metadataPath = path.resolve(appRootPath.path, `packages/projects/`, filePath)
            if (!fs.existsSync(path.dirname(metadataPath)))
              fs.mkdirSync(path.dirname(metadataPath), { recursive: true })
            fs.writeFileSync(metadataPath, fileResult.Body)
            resolve(getCachedAsset(filePath, storageProvider.cacheDomain, params && params.provider == null))
          })
        )
      }
      return Promise.all(promises)
    } else {
      return uploadLocalProjectToProvider(projectName)
    }
  }

  async remove(id: Id, params?: Params) {
    if (id) {
      try {
        const { name } = await super.get(id, params)

        const projectConfig = await getProjectConfig(name)

        // run project uninstall script
        if (projectConfig.onEvent) {
          await onProjectEvent(this.app, name, projectConfig.onEvent, 'onUninstall')
        }

        if (fs.existsSync(path.resolve(projectsRootFolder, name))) {
          fs.rmSync(path.resolve(projectsRootFolder, name), { recursive: true })
        }

        logger.info(`[Projects]: removing project id "${id}", name: "${name}".`)
        await deleteProjectFilesInStorageProvider(name)
        await super.remove(id, params)
      } catch (e) {
        logger.error(`[Projects]: failed to remove project "${id}":`, e)
        return e
      }
    }
  }

  async get(name: string, params?: Params): Promise<{ data: ProjectInterface }> {
    const data: ProjectInterface[] = ((await super.find(params)) as any).data
    const project = data.find((e) => e.name === name)
    if (!project) return null!
    return {
      data: project
    }
  }

  async updateSettings(id: Id, data: { settings: string }) {
    return super.patch(id, data)
  }

  //@ts-ignore
  async find(params?: Params): Promise<{ data: ProjectInterface[] }> {
    params = {
      ...params,
      query: {
        ...params?.query,
        $select: params?.query?.$select || ['id', 'name', 'thumbnail', 'repositoryPath', 'storageProviderPath']
      }
    }

    const data: ProjectInterface[] = ((await super.find(params)) as any).data
    return {
      data
    }
  }
}
