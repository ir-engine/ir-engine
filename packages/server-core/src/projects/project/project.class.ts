import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Id, Params } from '@feathersjs/feathers'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { ProjectConfigInterface } from '@xrengine/projects/ProjectConfigInterface'
import fs from 'fs'
import path from 'path'
import { isDev } from '@xrengine/common/src/utils/isDev'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { getGitData } from '../../util/getGitData'
import { useGit } from '../../util/gitHelperFunctions'
import { copyFolderRecursiveSync, deleteFolderRecursive, getFilesRecursive } from '../../util/fsHelperFunctions'
import appRootPath from 'app-root-path'
import templateProjectJson from '@xrengine/projects/template/package.json'
import { cleanString } from '../../util/cleanString'
import { getContentType } from '../../util/fileUtils'
import { getFileKeysRecursive } from '../../media/storageprovider/storageProviderUtils'
import config from '../../appconfig'
import { getCachedAsset } from '../../media/storageprovider/getCachedAsset'

const templateFolderDirectory = path.resolve(appRootPath.path, `packages/projects/template`)

export const copyDefaultProject = () => {
  const seedPath = path.resolve(appRootPath.path, `packages/projects/projects`)
  deleteFolderRecursive(path.resolve(seedPath, `default-project`))
  copyFolderRecursiveSync(path.resolve(appRootPath.path, `packages/projects/default-project`), seedPath)
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
  if (remove) {
    await deleteProjectFilesInStorageProvider(projectName)
  }
  // upload new files to storage provider
  const projectPath = path.resolve(appRootPath.path, 'packages/projects/projects/', projectName)
  const files = getFilesRecursive(projectPath)
  const results = await Promise.all(
    files.map((file: string) => {
      return new Promise(async (resolve) => {
        try {
          const fileResult = fs.readFileSync(file)
          const filePathRelative = file.slice(projectPath.length)
          await storageProvider.putObject({
            Body: fileResult,
            ContentType: getContentType(file),
            Key: `projects/${projectName}${filePathRelative}`
          })
          resolve(getCachedAsset(`projects/${projectName}${filePathRelative}`, storageProvider.cacheDomain))
        } catch (e) {
          resolve(null)
        }
      })
    })
  )
  // console.log('uploadLocalProjectToProvider', results)
  return results.filter((success) => !!success) as string[]
}

export class Project extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app

    // copy default project if it doesn't exist
    if (!fs.existsSync(path.resolve(appRootPath.path, `packages/projects/projects/default-project`)))
      copyDefaultProject()

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

    const projectsRootFolder = path.resolve(appRootPath.path, 'packages/projects/projects/')

    if (!fs.existsSync(projectsRootFolder)) {
      fs.mkdirSync(projectsRootFolder, { recursive: true })
    }

    const locallyInstalledProjects = fs
      .readdirSync(projectsRootFolder, { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    const promises = []

    for (const projectName of locallyInstalledProjects) {
      if (!data.find((e) => e.name === projectName)) {
        try {
          console.warn('[Projects]: Found new locally installed project', projectName)
          const projectConfig: ProjectConfigInterface = (
            await import(`@xrengine/projects/projects/${projectName}/xrengine.config.ts`)
          ).default
          await super.create({
            thumbnail: projectConfig.thumbnail,
            name: projectName,
            storageProviderPath: getStorageProviderPath(projectName),
            repositoryPath: getRemoteURLFromGitData(projectName)
          })
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
    const projectName = cleanString(data.name)

    const projectLocalDirectory = path.resolve(appRootPath.path, `packages/projects/projects/${projectName}/`)

    copyFolderRecursiveSync(templateFolderDirectory, projectLocalDirectory)

    fs.mkdirSync(path.resolve(projectLocalDirectory, '.git'), { recursive: true })

    const git = useGit(path.resolve(projectLocalDirectory, '.git'))
    try {
      await git.init(true)
    } catch (e) {
      console.warn(e)
    }

    const packageData = Object.assign({}, templateProjectJson) as any
    packageData.name = projectName
    fs.writeFileSync(path.resolve(projectLocalDirectory, 'package.json'), JSON.stringify(packageData, null, 2))

    await super.create(
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

    const existingProjectResult = await this.Model.findOne({
      where: {
        name: projectName
      }
    })
    if (existingProjectResult != null) await super.remove(existingProjectResult.id, params)

    const git = useGit()
    await git.clone(data.url, projectLocalDirectory)

    await uploadLocalProjectToProvider(projectName)

    let projectConfig: ProjectConfigInterface = {}
    try {
      projectConfig = (await import(`@xrengine/projects/projects/${projectName}/xrengine.config.ts`)).default
    } catch (e) {
      console.log(
        `[Projects]: WARNING project with name ${projectName} has no xrengine.config.ts file - this is not recommended`
      )
    }

    // Add to DB
    await super.create(
      {
        thumbnail: projectConfig.thumbnail,
        name: projectName,
        storageProviderPath: getStorageProviderPath(projectName),
        repositoryPath: data.url
      },
      params || {}
    )
  }

  /**
   * downloads file from storage provider to project
   *   OR
   * uploads project to the storage provider
   * @param app
   * @returns
   */
  async patch(projectName: string, data?: { files: string[] }, params?: Params) {
    if (data?.files?.length) {
      const promises = []
      for (const filePath of data.files) {
        promises.push(
          new Promise<string>(async (resolve) => {
            const fileResult = await storageProvider.getObject(filePath)
            const metadataPath = path.resolve(appRootPath.path, `packages/projects/`, filePath)
            if (!fs.existsSync(path.dirname(metadataPath)))
              fs.mkdirSync(path.dirname(metadataPath), { recursive: true })
            fs.writeFileSync(metadataPath, fileResult.Body)
            resolve(getCachedAsset(filePath, storageProvider.cacheDomain))
          })
        )
      }
      return Promise.all(promises)
    } else {
      return uploadLocalProjectToProvider(projectName)
    }
  }

  async remove(id: Id, params?: Params) {
    try {
      const { name } = await super.get(id, params)
      console.log('[Projects]: removing project', id, name)
      await deleteProjectFilesInStorageProvider(name)
      await super.remove(id, params)
    } catch (e) {
      console.log(`[Projects]: failed to remove project ${id}`, e)
      return e
    }
  }
}
