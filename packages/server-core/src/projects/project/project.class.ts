import { BadRequest, Forbidden } from '@feathersjs/errors'
import { Id, Params } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import { SequelizeServiceOptions, Service } from 'feathers-sequelize'
import fs from 'fs'
import path from 'path'
import Sequelize, { Op } from 'sequelize'

import { GITHUB_URL_REGEX, PUBLIC_SIGNED_REGEX } from '@etherealengine/common/src/constants/GitHubConstants'
import {
  DefaultUpdateSchedule,
  ProjectInterface,
  ProjectUpdateType
} from '@etherealengine/common/src/interfaces/ProjectInterface'
import { UserInterface } from '@etherealengine/common/src/interfaces/User'
import { processFileName } from '@etherealengine/common/src/utils/processFileName'
import templateProjectJson from '@etherealengine/projects/template-project/package.json'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { getCacheDomain } from '../../media/storageprovider/getCacheDomain'
import { getCachedURL } from '../../media/storageprovider/getCachedURL'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'
import logger from '../../ServerLogger'
import { UserParams } from '../../user/user/user.class'
import { cleanString } from '../../util/cleanString'
import { getContentType } from '../../util/fileUtils'
import { copyFolderRecursiveSync, deleteFolderRecursive, getFilesRecursive } from '../../util/fsHelperFunctions'
import { getGitConfigData, getGitHeadData, getGitOrigHeadData } from '../../util/getGitData'
import { useGit } from '../../util/gitHelperFunctions'
import {
  checkAppOrgStatus,
  checkUserOrgWriteStatus,
  checkUserRepoWriteStatus,
  getAuthenticatedRepo,
  getRepo,
  getUserRepos
} from './github-helper'
import {
  createOrUpdateProjectUpdateJob,
  getEnginePackageJson,
  getProjectConfig,
  getProjectPackageJson,
  onProjectEvent,
  removeProjectUpdateJob
} from './project-helper'

const templateFolderDirectory = path.join(appRootPath.path, `packages/projects/template-project/`)

const projectsRootFolder = path.join(appRootPath.path, 'packages/projects/projects/')

export type ProjectQueryParams = {
  sourceURL?: string
  destinationURL?: string
  existingProject?: boolean
  inputProjectURL?: string
  branchName?: string
  selectedSHA?: string
}

export type ProjectParams = {
  user: UserInterface
} & Params<ProjectQueryParams>

export type ProjectParamsClient = Omit<ProjectParams, 'user'>

export const copyDefaultProject = () => {
  deleteFolderRecursive(path.join(projectsRootFolder, `default-project`))
  copyFolderRecursiveSync(path.join(appRootPath.path, 'packages/projects/default-project'), projectsRootFolder)
}

const getGitProjectData = (project) => {
  const response = {
    repositoryPath: '',
    sourceRepo: '',
    sourceBranch: '',
    commitSHA: ''
  }

  //TODO: We can use simpleGit instead of manually accessing files.
  const projectGitDir = path.resolve(__dirname, `../../../../projects/projects/${project}/.git`)

  const config = getGitConfigData(projectGitDir)
  if (config?.remote?.origin?.url) {
    response.repositoryPath = config?.remote?.origin?.url
    response.sourceRepo = config?.remote?.origin?.url
  }

  const branch = getGitHeadData(projectGitDir)
  if (branch) {
    response.sourceBranch = branch
  }

  const sha = getGitOrigHeadData(projectGitDir, branch)
  if (sha) {
    response.commitSHA = sha
  }

  return response
}

export const deleteProjectFilesInStorageProvider = async (projectName: string, storageProviderName?: string) => {
  const storageProvider = getStorageProvider(storageProviderName)
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
 * @param storageProviderName
 * @param remove
 */
export const uploadLocalProjectToProvider = async (projectName, remove = true, storageProviderName?: string) => {
  const storageProvider = getStorageProvider(storageProviderName)
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
            const filePathRelative = processFileName(file.slice(projectPath.length))
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

  async _getCommitSHADate(projectName: string): Promise<{ commitSHA: string; commitDate: Date }> {
    const projectDirectory = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}/`)
    const git = useGit(projectDirectory)
    let commitSHA = ''
    let commitDate
    try {
      commitSHA = await git.revparse(['HEAD'])
      const commit = await git.log(['-1'])
      commitDate = commit?.latest?.date ? new Date(commit.latest.date) : new Date()
    } catch (err) {}
    return {
      commitSHA,
      commitDate
    }
  }

  async _callOnLoad() {
    const projects = (
      (await super.find({
        query: { $select: ['name'] }
      })) as any
    ).data as Array<{ name }>
    await Promise.all(
      projects.map(async ({ name }) => {
        if (!fs.existsSync(path.join(projectsRootFolder, name, 'xrengine.config.ts'))) return
        const config = await getProjectConfig(name)
        if (config?.onEvent) return onProjectEvent(this.app, name, config.onEvent, 'onLoad')
      })
    )
  }

  async _seedProject(projectName: string): Promise<any> {
    logger.warn('[Projects]: Found new locally installed project: ' + projectName)
    const projectConfig = (await getProjectConfig(projectName)) ?? {}

    const gitData = getGitProjectData(projectName)
    const { commitSHA, commitDate } = await this._getCommitSHADate(projectName)
    await super.create({
      thumbnail: projectConfig.thumbnail,
      name: projectName,
      repositoryPath: gitData.repositoryPath,
      sourceRepo: gitData.sourceRepo,
      sourceBranch: gitData.sourceBranch,
      commitSHA,
      commitDate,
      needsRebuild: true,
      updateType: 'none' as ProjectUpdateType,
      updateSchedule: DefaultUpdateSchedule
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
    const data = (await this.Model.findAll({ paginate: false })) as ProjectInterface[]

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

      const { commitSHA, commitDate } = await this._getCommitSHADate(projectName)

      await this.Model.update(
        { commitSHA, commitDate },
        {
          where: {
            name: projectName
          }
        }
      )

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
    packageData.etherealEngine.version = getEnginePackageJson().version
    fs.writeFileSync(path.resolve(projectLocalDirectory, 'package.json'), JSON.stringify(packageData, null, 2))

    await uploadLocalProjectToProvider(projectName, false)

    return super.create(
      {
        thumbnail: packageData.thumbnail,
        name: projectName,
        repositoryPath: null,
        needsRebuild: true
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
  async update(
    data: {
      sourceURL: string
      destinationURL: string
      name?: string
      needsRebuild?: boolean
      reset?: boolean
      commitSHA?: string
      sourceBranch: string
      updateType: ProjectUpdateType
      updateSchedule: string
    },
    placeholder?: null,
    params?: UserParams
  ) {
    if (data.sourceURL === 'default-project') {
      copyDefaultProject()
      await uploadLocalProjectToProvider('default-project')
      return
    }

    const urlParts = data.sourceURL.split('/')
    let projectName = data.name || urlParts.pop()
    if (!projectName) throw new Error('Git repo must be plain URL')
    projectName = projectName.toLowerCase()
    if (projectName.substring(projectName.length - 4) === '.git') projectName = projectName.slice(0, -4)
    if (projectName.substring(projectName.length - 1) === '/') projectName = projectName.slice(0, -1)

    const projectLocalDirectory = path.resolve(appRootPath.path, `packages/projects/projects/`)
    const projectDirectory = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}/`)

    // if project exists already, remove it and re-clone it
    if (fs.existsSync(projectDirectory)) {
      // if (isDev) throw new Error('Cannot create project - already exists')
      deleteFolderRecursive(projectDirectory)
    }

    const project = await this.app.service('project').Model.findOne({
      where: {
        name: projectName
      }
    })

    const userId = params!.user?.id || project.updateUserId

    const githubIdentityProvider = await this.app.service('identity-provider').Model.findOne({
      where: {
        userId: userId,
        type: 'github'
      }
    })

    let repoPath = await getAuthenticatedRepo(githubIdentityProvider.oauthToken, data.sourceURL)
    if (!repoPath) repoPath = data.sourceURL //public repo

    const gitCloner = useGit(projectLocalDirectory)
    await gitCloner.clone(repoPath, projectDirectory)
    const git = useGit(projectDirectory)
    const branchName = `${config.server.releaseName}-deployment`
    try {
      const branchExists = await git.raw(['ls-remote', '--heads', repoPath, `${branchName}`])
      if (data.commitSHA) await git.checkout(data.commitSHA)
      if (branchExists.length === 0 || data.reset) {
        try {
          await git.deleteLocalBranch(branchName)
        } catch (err) {}
        await git.checkoutLocalBranch(branchName)
      } else await git.checkout(branchName)
    } catch (err) {
      logger.error(err)
      throw err
    }

    await uploadLocalProjectToProvider(projectName)

    const projectConfig = (await getProjectConfig(projectName)) ?? {}

    // when we have successfully re-installed the project, remove the database entry if it already exists
    const existingProjectResult = await this.Model.findOne({
      where: {
        [Op.or]: [
          Sequelize.where(Sequelize.fn('lower', Sequelize.col('name')), {
            [Op.like]: '%' + projectName + '%'
          })
        ]
      }
    })
    let repositoryPath = data.destinationURL || data.sourceURL
    const publicSignedExec = PUBLIC_SIGNED_REGEX.exec(repositoryPath)
    //In testing, intermittently the signed URL was being entered into the database, which made matching impossible.
    //Stripping the signed portion out if it's about to be inserted.
    if (publicSignedExec) repositoryPath = `https://github.com/${publicSignedExec[1]}/${publicSignedExec[2]}`
    const { commitSHA, commitDate } = await this._getCommitSHADate(projectName)
    const returned = !existingProjectResult
      ? // Add to DB
        await super.create(
          {
            thumbnail: projectConfig.thumbnail,
            name: projectName,
            repositoryPath,
            needsRebuild: data.needsRebuild ? data.needsRebuild : true,
            sourceRepo: data.sourceURL,
            sourceBranch: data.sourceBranch,
            updateType: data.updateType,
            updateSchedule: data.updateSchedule,
            updateUserId: userId,
            commitSHA,
            commitDate
          },
          params || {}
        )
      : await super.patch(existingProjectResult.id, {
          commitSHA,
          commitDate,
          sourceRepo: data.sourceURL,
          sourceBranch: data.sourceBranch,
          updateType: data.updateType,
          updateSchedule: data.updateSchedule,
          updateUserId: userId
        })

    returned.needsRebuild = typeof data.needsRebuild === 'boolean' ? data.needsRebuild : true

    if (!existingProjectResult) {
      await this.app.service('project-permission').create({
        projectId: returned.id,
        userId
      })
    }

    if (returned.name !== projectName)
      await super.patch(existingProjectResult.id, {
        name: projectName
      })

    if (data.reset) {
      let repoPath = await getAuthenticatedRepo(githubIdentityProvider.oauthToken, data.destinationURL)
      if (!repoPath) repoPath = data.destinationURL //public repo
      await git.addRemote('destination', repoPath)
      await git.push('destination', branchName, ['-f', '--tags'])
      const { commitSHA, commitDate } = await this._getCommitSHADate(projectName)
      await super.patch(returned.id, {
        commitSHA,
        commitDate
      })
    }
    // run project install script
    if (projectConfig.onEvent) {
      await onProjectEvent(
        this.app,
        projectName,
        projectConfig.onEvent,
        existingProjectResult ? 'onUpdate' : 'onInstall'
      )
    }

    if (this.app.k8BatchClient && (data.updateType === 'tag' || data.updateType === 'commit')) {
      await createOrUpdateProjectUpdateJob(this.app, projectName)
    } else if (this.app.k8BatchClient && (data.updateType === 'none' || data.updateType == null))
      await removeProjectUpdateJob(this.app, projectName)

    return returned
  }

  async patch(id: Id, data: any, params?: UserParams) {
    if (data.repositoryPath) {
      const repoPath = data.repositoryPath
      const user = params!.user!
      const githubIdentityProvider = await this.app.service('identity-provider').Model.findOne({
        where: {
          userId: user.id,
          type: 'github'
        }
      })
      const githubPathRegexExec = GITHUB_URL_REGEX.exec(repoPath)
      if (!githubPathRegexExec) throw new BadRequest('Invalid Github URL')
      if (!githubIdentityProvider) throw new Error('Must be logged in with GitHub to link a project to a GitHub repo')
      const split = githubPathRegexExec[2].split('/')
      const org = split[0]
      const repo = split[1].replace('.git', '')
      const appOrgAccess = await checkAppOrgStatus(org, githubIdentityProvider.oauthToken)
      if (!appOrgAccess)
        throw new Forbidden(
          `The organization ${org} needs to install the GitHub OAuth app ${config.authentication.oauth.github.key} in order to push code to its repositories`
        )
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

    const locationItems = await (this.app.service('location') as any).Model.findAll({
      where: {
        sceneId: {
          [Op.like]: `${name}/%`
        }
      }
    })
    locationItems.length &&
      locationItems.forEach(async (location) => {
        await this.app.service('location').remove(location.dataValues.id)
      })

    const whereClause = {
      [Op.and]: [
        {
          project: name
        },
        {
          project: {
            [Op.ne]: null
          }
        }
      ]
    }

    const routeItems = await (this.app.service('route') as any).Model.findAll({
      where: whereClause
    })
    routeItems.length &&
      routeItems.forEach(async (route) => {
        await this.app.service('route').remove(route.dataValues.id)
      })

    const avatarItems = await (this.app.service('avatar') as any).Model.findAll({
      where: whereClause
    })
    await Promise.all(
      avatarItems.map(async (avatar) => {
        await this.app.service('avatar').remove(avatar.dataValues.id)
      })
    )

    const staticResourceItems = await (this.app.service('static-resource') as any).Model.findAll({
      where: whereClause
    })
    staticResourceItems.length &&
      staticResourceItems.forEach(async (staticResource) => {
        await this.app.service('static-resource').remove(staticResource.dataValues.id)
      })

    await removeProjectUpdateJob(this.app, name)

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
  async find(params?: UserParams): Promise<{ data: ProjectInterface[]; errors: any[] }> {
    let projectPushIds: string[] = []
    const errors = [] as any
    if (params?.query?.allowed != null) {
      // See if the user has a GitHub identity-provider, and if they do, also determine which GitHub repos they personally
      // can push to.
      const githubIdentityProvider = await this.app.service('identity-provider').Model.findOne({
        where: {
          userId: params.user!.id,
          type: 'github'
        }
      })

      // Get all of the projects that this user has permissions for, then calculate push status by whether the user
      // can push to it. This will make sure no one tries to push to a repo that they do not have write access to.
      const projectPermissions = (await this.app.service('project-permission').Model.findAll({
        where: { userId: params.user!.id },
        include: [{ model: this.app.service('project').Model }],
        paginate: false
      })) as any
      let allowedProjects = await projectPermissions.map((permission) => permission.project)
      const repoAccess = githubIdentityProvider
        ? await this.app.service('github-repo-access').Model.findAll({
            paginate: false,
            where: {
              identityProviderId: githubIdentityProvider.id
            }
          })
        : []
      const pushRepoPaths = repoAccess.filter((repo) => repo.hasWriteAccess).map((item) => item.repo.toLowerCase())
      let allowedProjectGithubRepos = allowedProjects.filter((project) => project.repositoryPath != null)
      allowedProjectGithubRepos = await Promise.all(
        allowedProjectGithubRepos.map(async (project) => {
          const regexExec = GITHUB_URL_REGEX.exec(project.repositoryPath)
          if (!regexExec) return { repositoryPath: '', name: '' }
          const split = regexExec[2].split('/')
          project.repositoryPath = `https://github.com/${split[0]}/${split[1]}`
          return project
        })
      )
      const pushableAllowedProjects = allowedProjectGithubRepos.filter(
        (project) => pushRepoPaths.indexOf(project.repositoryPath.toLowerCase().replace(/.git$/, '')) > -1
      )
      projectPushIds = projectPushIds.concat(pushableAllowedProjects.map((project) => project.id))

      if (githubIdentityProvider) {
        repoAccess.forEach((item, index) => {
          if (item.hasWriteAccess) {
            const url = item.repo.toLowerCase()
            repoAccess[index] = url
            repoAccess.push(`${url}.git`)
            const regexExec = GITHUB_URL_REGEX.exec(url)
            if (regexExec) {
              const split = regexExec[2].split('/')
              repoAccess.push(`git@github.com:${split[0]}/${split[1]}`)
              repoAccess.push(`git@github.com:${split[0]}/${split[1]}.git`)
            }
          } else repoAccess.splice(index)
        })

        const matchingAllowedRepos = await this.app.service('project').Model.findAll({
          where: {
            repositoryPath: {
              [Op.in]: repoAccess
            }
          }
        })

        projectPushIds = projectPushIds.concat(matchingAllowedRepos.map((repo) => repo.id))
      }

      if (!params.user!.scopes?.find((scope) => scope.type === 'admin:admin'))
        params.query.id = { $in: [...new Set(allowedProjects.map((project) => project.id))] }
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
        $select: params?.query?.$select || [
          'id',
          'name',
          'thumbnail',
          'repositoryPath',
          'needsRebuild',
          'sourceRepo',
          'sourceBranch',
          'updateType',
          'updateSchedule',
          'commitSHA',
          'commitDate'
        ]
      }
    }

    const data: ProjectInterface[] = ((await super.find(params)) as any).data
    data.forEach((item) => {
      const values = (item as any).dataValues
        ? ((item as any).dataValues as ProjectInterface)
        : (item as ProjectInterface)
      try {
        const packageJson = getProjectPackageJson(values.name)
        values.version = packageJson.version
        values.engineVersion = packageJson.etherealEngine?.version
        values.description = packageJson.description
        values.hasWriteAccess = projectPushIds.indexOf(item.id) > -1
      } catch (err) {}
    })

    return {
      data,
      errors
    }
  }
}
