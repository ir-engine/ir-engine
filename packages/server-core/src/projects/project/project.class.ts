import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Id, Params } from '@feathersjs/feathers'
import { ProjectInterface, ProjectPackageInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import fs from 'fs'
import path from 'path'
import { isDev } from '@xrengine/common/src/utils/isDev'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { getGitData } from '../../util/getGitData'
import { useGit } from '../../util/gitHelperFunctions'
import { deleteFolderRecursive, getFilesRecursive } from '../../util/fsHelperFunctions'
import appRootPath from 'app-root-path'
import templateProjectJson from './template-project.json'
import { cleanString } from '../../util/cleanString'
import { getContentType } from '../../util/fileUtils'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'
import config from '../../appconfig'

const getRemoteURLFromGitData = (project) => {
  const data = getGitData(path.resolve(__dirname, `../../../../projects/projects/${project}/.git/config`))
  if (!data?.remote) return null
  return data.remote.origin.url
}

const storageProvider = useStorageProvider()
export const getStorageProviderPath = (projectName: string) =>
  `https://${storageProvider.cacheDomain}/projects/${projectName}/`

/**
 * Updates the local storage provider with the project's current files
 * @param projectName
 */
export const uploadLocalProjectToProvider = async (projectName) => {
  // remove exiting storage provider files
  const existingFiles = await getFileKeysRecursive(`projects/${projectName}`)
  if (existingFiles.length) {
    await Promise.all([
      storageProvider.deleteResources(existingFiles),
      storageProvider.createInvalidation(existingFiles)
    ])
  }
  // upload new files to storage provider
  const projectPath = path.resolve(appRootPath.path, 'packages/projects/projects/', projectName)
  const files = getFilesRecursive(projectPath)
  await Promise.all(
    files.map((file: string) => {
      new Promise(async (resolve) => {
        try {
          const fileResult = fs.readFileSync(file)
          const filePathRelative = file.slice(projectPath.length)
          await storageProvider.putObject({
            Body: fileResult,
            ContentType: getContentType(file),
            Key: `projects/${projectName}/${filePathRelative}`
          })
        } catch (e) {}
        resolve(true)
      })
    })
  )
}

export class Project extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
    console.log('isDev', isDev)
    if (isDev && !config.db.forceRefresh) {
      this._fetchDevLocalProjects()
    }
  }

  /**
   * On dev, sync the db with any projects installed locally
   */
  private async _fetchDevLocalProjects() {
    const dbEntries = (await super.find()) as any
    const data: ProjectInterface[] = dbEntries.data
    console.log(dbEntries)

    const locallyInstalledProjects = fs
      .readdirSync(path.resolve(appRootPath.path, 'packages/projects/projects/'), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    const promises = []

    for (const projectName of locallyInstalledProjects) {
      const projectPath = path.resolve(appRootPath.path, 'packages/projects/projects/', projectName)
      if (!data.find((e) => e.name === projectName)) {
        try {
          const packageData = JSON.parse(fs.readFileSync(path.resolve(projectPath, 'package.json'), 'utf8'))
            .xrengine as ProjectPackageInterface

          if (!packageData) {
            console.warn(`[Projects]: No 'xrengine' data found in package.json for project ${projectName}, aborting.`)
            continue
          }

          const dbEntryData: ProjectInterface = {
            ...packageData,
            name: projectName,
            storageProviderPath: getStorageProviderPath(projectName),
            repositoryPath: getRemoteURLFromGitData(projectName)
          }

          console.warn('[Projects]: Found new locally installed project', projectName)
          await super.create(dbEntryData)
        } catch (e) {
          console.log(e)
        }
      }

      promises.push(uploadLocalProjectToProvider(projectName))
    }

    for (const { name, id } of data) {
      if (!locallyInstalledProjects.includes(name)) {
        console.warn(`[Projects]: Project ${name} not found, assuming removed`)
        await super.remove(id)
      }
    }
  }

  async create(data: { name: string }, params?: Params) {
    // make alphanumeric period, underscore, dash
    const projectName = cleanString(data.name)
    console.log(projectName)

    const projectLocalDirectory = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}/`)

    fs.mkdirSync(path.resolve(projectLocalDirectory, '.git'), { recursive: true })
    console.log(path.resolve(projectLocalDirectory, '.git'))

    const git = useGit(path.resolve(projectLocalDirectory, '.git'))
    try {
      await git.init(true)
    } catch (e) {
      console.warn(e)
    }

    const packageData = Object.assign({}, templateProjectJson) as any
    packageData.name = projectName
    fs.writeFileSync(path.resolve(projectLocalDirectory, 'package.json'), JSON.stringify(packageData, null, 2))

    const dbEntryData: ProjectInterface = {
      ...packageData,
      repositoryPath: null
    }

    await super.create(dbEntryData)
  }

  /**
   * 1. Clones the repo to the local FS
   * 2. If in production mode, uploads it to the storage provider
   * 3. Creates a database entry
   * @param app
   * @returns
   */
  // @ts-ignore
  async update(data: { url: string }, params: Params) {
    const urlParts = data.url.split('/')
    let projectName = urlParts.pop()
    if (!projectName) throw new Error('Git repo must be plain URL')
    if (projectName.substr(-4) === '.git') projectName = projectName.slice(0, -4)
    if (projectName.substr(-1) === '/') projectName = projectName.slice(0, -1)

    const projectLocalDirectory = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}/`)

    // remove existing files in fs
    if (fs.existsSync(projectLocalDirectory)) {
      // disable accidental deletion of projects for local development
      if (isDev) throw new Error('Cannot create project - already exists')
      deleteFolderRecursive(projectLocalDirectory)
    }

    const existingPackResult = await this.Model.findOne({
      where: {
        name: projectName
      }
    })
    if (existingPackResult != null) await super.remove(existingPackResult.id, params)

    const git = useGit()
    await git.clone(data.url, projectLocalDirectory)

    await uploadLocalProjectToProvider(projectName)

    // TODO: populate avatars & scenes

    const packageData = JSON.parse(fs.readFileSync(path.resolve(projectLocalDirectory, 'package.json'), 'utf8'))
      .xrengine as ProjectPackageInterface

    // Add to DB
    const dbEntryData: ProjectInterface = {
      ...packageData,
      name: projectName,
      storageProviderPath: getStorageProviderPath(projectName),
      repositoryPath: data.url
    }

    await super.create(dbEntryData, params)
  }

  /**
   * 1. uploads project to the storage provider
   * @param app
   * @returns
   */
  async patch(projectName: string, params?: Params) {
    await uploadLocalProjectToProvider(projectName)
  }

  async remove(id: Id, params?: Params) {
    console.log('remove', id)
    try {
      await super.remove(id, params)
    } catch (e) {
      console.log(`[Projects]: failed to remove project ${id}`, e)
      return e
    }
  }

  /**
   * Gets the metadata from the local fs
   *
   * @param id
   * @param params
   * @returns
   */
  // TODO: remove this entire function when nodes reference file browser
  async get(name: string, params?: Params): Promise<{ data: ProjectInterface }> {
    const data: ProjectInterface[] = ((await super.find(params)) as any).data
    const entry = data.find((e) => e.name === name)
    if (!entry) return

    const metadataPath = path.resolve(appRootPath.path, `packages/projects/projects/${name}/package.json`)
    if (fs.existsSync(metadataPath)) {
      try {
        const json: ProjectPackageInterface = JSON.parse(fs.readFileSync(metadataPath, 'utf8')).xrengine
        return {
          data: {
            ...json,
            ...entry
          }
        }
      } catch (e) {
        console.warn('[getProjects]: Failed to read package.json for project', name, 'with error', e)
        return
      }
    }
    return {
      data: entry
    }
  }

  /**
   * Gets the metadata from the local fs
   *
   * @param params
   * @returns
   */
  // TODO: remove this entire function when nodes reference file browser
  async find(params: Params) {
    const entries = (await super.find(params)) as any
    entries.data = entries.data
      .map((entry) => {
        try {
          const json: ProjectPackageInterface = JSON.parse(
            fs.readFileSync(
              path.resolve(appRootPath.path, `packages/projects/projects/${entry.name}/package.json`),
              'utf8'
            )
          ).xrengine
          return {
            ...json,
            ...entry
          }
        } catch (e) {
          console.warn('[getProjects]: Failed to read package.json for project', entry.name, 'with error', e)
          return
        }
      })
      .filter((entry) => !!entry)
    return entries
  }
}
