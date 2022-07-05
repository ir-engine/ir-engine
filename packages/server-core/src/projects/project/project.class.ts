import { BadRequest, Forbidden } from '@feathersjs/errors'
import { Id, Params } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import fs from 'fs'
import path from 'path'
import { Op } from 'sequelize'

import { GITHUB_URL_REGEX } from '@xrengine/common/src/constants/GitHubConstants'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { isDev } from '@xrengine/common/src/utils/isDev'
import templateProjectJson from '@xrengine/projects/template-project/package.json'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../logger'
import { getCacheDomain } from '../../media/storageprovider/getCacheDomain'
import { getCachedURL } from '../../media/storageprovider/getCachedURL'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'
import { cleanString } from '../../util/cleanString'
import { getContentType } from '../../util/fileUtils'
import { copyFolderRecursiveSync, deleteFolderRecursive, getFilesRecursive } from '../../util/fsHelperFunctions'
import { getGitData } from '../../util/getGitData'
import { useGit } from '../../util/gitHelperFunctions'
import {
  checkUserOrgWriteStatus,
  checkUserRepoWriteStatus,
  getAuthenticatedRepo,
  getUserRepos
} from '../githubapp/githubapp-helper'
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

export const deleteProjectFilesInStorageProvider = async (projectName: string) => {
  const storageProvider = getStorageProvider()
  try {
    const existingFiles = await getFileKeysRecursive(`projects/${projectName}`)
    if (existingFiles.length) {
      await Promise.all([
        storageProvider.deleteResources(existingFiles),
        storageProvider.createInvalidation([`projects/${projectName}*`])
      ])
    }
  } catch (e) {
    logger.info('[ERROR deleteProjectFilesInStorageProvider]:', e)
  }
}

/**
 * Updates the local storage provider with the project's current files
 * @param projectName
 */
export const uploadLocalProjectToProvider = async (projectName, remove = true) => {
  const storageProvider = getStorageProvider()
  const cacheDomain = getCacheDomain(storageProvider, true)

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
            await storageProvider.putObject(
              {
                Body: fileResult,
                ContentType: getContentType(file),
                Key: `projects/${projectName}${filePathRelative}`
              },
              { isDirectory: false }
            )
            resolve(getCachedURL(`projects/${projectName}${filePathRelative}`, cacheDomain))
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
        if (!fs.existsSync(path.join(projectsRootFolder, name))) return
        const config = await getProjectConfig(name)
        if (config?.onEvent) return onProjectEvent(this.app, name, config.onEvent, 'onLoad')
      })
    )
  }

  async _seedProject(projectName: string): Promise<any> {
    logger.warn('[Projects]: Found new locally installed project: ' + projectName)
    const projectConfig = (await getProjectConfig(projectName)) ?? {}
    await super.create({
      thumbnail: projectConfig.thumbnail,
      name: projectName,
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
    const projectLocalDirectory = path.resolve(projectsRootFolder, projectName)

    if (await this.Model.count({ where: { name: projectName } }))
      throw new Error(`[Projects]: Project with name ${projectName} already exists`)

    if ((!config.db.forceRefresh && projectName === 'default-project') || projectName === 'template-project')
      throw new Error(`[Projects]: Project name ${projectName} not allowed`)

    copyFolderRecursiveSync(templateFolderDirectory, projectsRootFolder)
    fs.renameSync(path.resolve(projectsRootFolder, 'template-project'), projectLocalDirectory)

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

    await uploadLocalProjectToProvider(projectName, false)

    return super.create(
      {
        thumbnail: packageData.thumbnail,
        name: projectName,
        repositoryPath: null
      },
      params
    )
  }

  /**
   * 1. Clones the repo to the local FS
   * 2. If in production mode, uploads it to the storage provider
   * 3. Creates a database entry
   * @param data
   * @param placeholder This is where data normally goes, but we've put data as the first parameter
   * @param params
   * @returns
   */
  // @ts-ignore
  async update(data: { url: string; name?: string }, placeholder?: null, params?: Params) {
    if (data.url === 'default-project') {
      copyDefaultProject()
      await uploadLocalProjectToProvider('default-project')
      return
    }

    const urlParts = data.url.split('/')
    let projectName = data.name || urlParts.pop()
    if (!projectName) throw new Error('Git repo must be plain URL')
    if (projectName.substring(projectName.length - 4) === '.git') projectName = projectName.slice(0, -4)
    if (projectName.substring(projectName.length - 1) === '/') projectName = projectName.slice(0, -1)

    const projectLocalDirectory = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}/`)

    // if project exists already, remove it and re-clone it
    if (fs.existsSync(projectLocalDirectory)) {
      // if (isDev) throw new Error('Cannot create project - already exists')
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
    const returned = !existingProjectResult
      ? // Add to DB
        await super.create(
          {
            thumbnail: projectConfig.thumbnail,
            name: projectName,
            repositoryPath: data.url
          },
          params || {}
        )
      : existingProjectResult

    if (!existingProjectResult) {
      await this.app.service('project-permission').create({
        projectId: returned.id,
        userId: params!.user.id
      })
    }

    // run project install script
    if (projectConfig.onEvent) {
      await onProjectEvent(this.app, projectName, projectConfig.onEvent, 'onInstall')
    }

    return returned
  }

  async patch(id: Id, data: any, params?: Params) {
    if (data.repositoryPath) {
      const repoPath = data.repositoryPath
      const user = params!.user
      const githubIdentityProvider = await this.app.service('identity-provider').Model.findOne({
        where: {
          userId: user.id,
          type: 'github'
        }
      })
      const githubPathRegexExec = GITHUB_URL_REGEX.exec(repoPath)
      if (!githubPathRegexExec) throw new BadRequest('Invalid Github URL')
      if (!githubIdentityProvider) throw new Error('Must be logged in with GitHub to link a project to a GitHub repo')
      const split = githubPathRegexExec[1].split('/')
      const org = split[0]
      const repo = split[1].replace('.git', '')
      const repoWriteStatus = await checkUserRepoWriteStatus(org, repo, githubIdentityProvider.oauthToken)
      if (repoWriteStatus !== 200) {
        if (repoWriteStatus === 404) {
          const orgWriteStatus = await checkUserOrgWriteStatus(org, githubIdentityProvider.oauthToken)
          if (orgWriteStatus !== 200) throw new Forbidden('You do not have write access to that organization')
        } else {
          throw new Forbidden('You do not have write access to that repo')
        }
      }
    }
    return super.patch(id, data, params)
  }

  async remove(id: Id, params?: Params) {
    if (!id) return
    const { name } = await super.get(id, params)

    const projectConfig = await getProjectConfig(name)

    // run project uninstall script
    if (projectConfig?.onEvent) {
      await onProjectEvent(this.app, name, projectConfig.onEvent, 'onUninstall')
    }

    if (fs.existsSync(path.resolve(projectsRootFolder, name))) {
      fs.rmSync(path.resolve(projectsRootFolder, name), { recursive: true })
    }

    logger.info(`[Projects]: removing project id "${id}", name: "${name}".`)
    await deleteProjectFilesInStorageProvider(name)
    return super.remove(id, params)
  }

  async get(name: string, params?: Params): Promise<{ data: ProjectInterface }> {
    if (!params) params = {}
    if (!params.query) params.query = {}
    if (!params.query.$limit) params.query.$limit = 1000
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
    let projectPushIds: string[] = []
    if (params?.query?.allowed != null) {
      const projectPermissions = (await this.app
        .service('project-permission')
        .Model.findAll({ where: { userId: params.user.id }, paginate: false })) as any
      const allowedProjectIds = await projectPermissions.map((permission) => permission.projectId)
      projectPushIds = projectPushIds.concat(allowedProjectIds)
      const githubIdentityProvider = await this.app.service('identity-provider').Model.findOne({
        where: {
          userId: params.user.id,
          type: 'github'
        }
      })
      if (githubIdentityProvider) {
        const allowedRepos = await getUserRepos(this.app, githubIdentityProvider.oauthToken)
        const matchingAllowedRepos = await this.app.service('project').Model.findAll({
          where: {
            [Op.or]: [
              {
                repositoryPath: {
                  [Op.in]: allowedRepos
                }
              },
              {
                repositoryPath: {
                  [Op.in]: allowedRepos.map((repo) => repo.replace('.git', ''))
                }
              }
            ]
          }
        })

        projectPushIds = projectPushIds.concat(matchingAllowedRepos.map((repo) => repo.id))
      }

      if (params.user.userRole !== 'admin') params.query.id = { $in: [...new Set(projectPushIds)] }
      delete params.query.allowed
      if (!params.sequelize) params.sequelize = { raw: false }
      if (!params.sequelize.include) params.sequelize.include = []
      params.sequelize.include.push({
        model: this.app.service('project-permission').Model,
        include: [this.app.service('user').Model]
      })
    }
    params = {
      ...params,
      query: {
        ...params?.query,
        $limit: params?.query?.$limit || 1000,
        $select: params?.query?.$select || ['id', 'name', 'thumbnail', 'repositoryPath']
      }
    }

    let data: ProjectInterface[] = ((await super.find(params)) as any).data
    data.forEach((item) =>
      (item as any).dataValues
        ? ((item as any).dataValues.hasWriteAccess = projectPushIds.indexOf(item.id) > -1)
        : (item.hasWriteAccess = projectPushIds.indexOf(item.id) > -1)
    )
    return {
      data
    }
  }
}
