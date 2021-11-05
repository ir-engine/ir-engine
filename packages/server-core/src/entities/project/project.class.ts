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
import { getFilesRecursive } from '../../util/fsHelperFunctions'

const getRemoteURLFromGitData = (project) => {
  const data = getGitData(path.resolve(__dirname, `../../../../projects/projects/${project}/.git/config`))
  if (!data) return
  return data.remote.origin.url
}

const storageProvider = useStorageProvider()

export class Project extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app

    if (isDev) {
      // TODO: find a better solution than a timeout for this
      setTimeout(() => {
        this._fetchDevLocalProjects()
      }, 3000)
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
      .readdirSync(path.resolve(__dirname, '../../../../projects/projects/'), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)

    for (const name of locallyInstalledProjects) {
      if (!data.find((e) => e.name === name)) {
        const packageData = JSON.parse(
          fs.readFileSync(path.resolve(__dirname, '../../../../projects/projects/', name, 'package.json'), 'utf8')
        ).xrengine as ProjectPackageInterface

        if (!packageData) {
          console.warn(`[Projects]: No 'xrengine' data found in package.json for project ${name}, aborting.`)
          continue
        }

        const dbEntryData: ProjectInterface = {
          ...packageData,
          name,
          repositoryPath: getRemoteURLFromGitData(name)
        }

        console.log('[Projects]: Found new locally installed project', name)
        super.create(dbEntryData)
      }
    }
  }

  /**
   * 1. Clones the repo to the local FS
   * 2. If in production mode, uploads it to the storage provider
   * 3. Creates a database entry
   * @param app
   * @returns
   */
  async create(data: { url: string }, params: Params) {
    const uploadPromises = []

    const urlParts = data.url.split('/')
    let projectName = urlParts.pop()
    if (!projectName) throw new Error('Git repo must be plain URL')
    if (projectName.substr(-4) === '.git') projectName = projectName.slice(0, -4)

    const projectLocalDirectory = path.resolve(__dirname, `../../../../projects/projects/${projectName}/`)

    // remove existing
    if (fs.existsSync(projectLocalDirectory)) {
      if (isDev) throw new Error('Cannot create project - already exists')
      fs.rmSync(projectLocalDirectory)
    }

    const existingPackResult = await this.Model.findOne({
      where: {
        name: projectName
      }
    })
    if (existingPackResult != null) await this.remove(existingPackResult.id, params)

    const git = useGit()
    await new Promise((resolve) => {
      git.clone(data.url, projectLocalDirectory, [], resolve)
    })

    // console.log('Installing project from ', data.uploadURL, 'with manifest.json', data)

    // upload files - TODO: replace with git integration
    const files = getFilesRecursive(projectLocalDirectory)
    files.forEach((file: string) => {
      uploadPromises.push(
        new Promise(async (resolve) => {
          try {
            const fileResult = fs.readFileSync(file)
            const filePathRelative = file.slice(projectLocalDirectory.length)
            await storageProvider.putObject({
              Body: fileResult,
              ContentType: file,
              Key: `project/${projectName}/${filePathRelative}`
            })
          } catch (e) {}
          resolve(true)
        })
      )
    })

    // TODO: populate avatars & scenes

    const packageData = JSON.parse(fs.readFileSync(path.resolve(projectLocalDirectory, 'package.json'), 'utf8'))
      .xrengine as ProjectPackageInterface

    // Add to DB
    const dbEntryData: ProjectInterface = {
      ...packageData,
      name: projectName,
      storageProviderPath: `https://${storageProvider.cacheDomain}/project/${projectName}/`,
      repositoryPath: data.url
    }

    await Promise.all([...uploadPromises, super.create(dbEntryData, params)])
    // TODO: trigger re-build
  }

  async remove(id: Id, params: Params) {
    try {
      if (!isDev) await super.remove(id, params)
      // TODO: trigger re-build
    } catch (e) {
      console.log(`[Projects]: failed to remove project ${id}`, e)
      return false
    }
    return true
  }

  /**
   * Gets the metadata from the local fs
   *
   * @param id
   * @param params
   * @returns
   */
  // TODO: remove this entire function when nodes reference file browser
  async get(name: string, params: Params): Promise<{ data: ProjectInterface }> {
    const data: ProjectInterface[] = ((await super.find(params)) as any).data
    const entry = data.find((e) => e.name === name)

    const metadataPath = path.resolve(__dirname, `../../../../projects/projects/${name}/package.json`)
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
        console.warn('[getProjects]: Failed to read manifest.json for project', name, 'with error', e)
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
    entries.data = await Promise.all(
      entries.data.map(async (entries) => {
        try {
          const json: ProjectPackageInterface = JSON.parse(
            fs.readFileSync(
              path.resolve(__dirname, '../../../../projects/projects/' + entries.name + '/package.json'),
              'utf8'
            )
          ).xrengine
          return {
            ...json,
            ...entries
          }
        } catch (e) {
          console.warn('[getProjects]: Failed to read manifest.json for project', name, 'with error', e)
          return
        }
      })
    )
    return entries
  }
}
