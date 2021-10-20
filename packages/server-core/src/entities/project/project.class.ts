import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Id, Params } from '@feathersjs/feathers'
import { getContentType } from '../content-pack/content-pack-helper'
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

    /**
     * On dev, sync the db with any projects installed locally
     */
    if (isDev) {
      super.find().then((dbEntries: any) => {
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

            packageData.name = name

            const dbEntryData: ProjectInterface = {
              ...packageData,
              repositoryPath: getRemoteURLFromGitData(name)
            }

            super.create(dbEntryData)
          }
        }
      })
    }
  }

  /**
   * 1. Clones the repo to the local FS
   * 2. If in production mode, uploads it to the storage provider
   * 3. Creates a database entry
   * @param app
   * @returns
   */
  async create(data: { url: string; branch: string; name: string }, params: Params) {
    const uploadPromises = []

    const projectLocalDirectory = path.resolve(__dirname, `../../../../projects/projects/${data.name}/`)

    // remove existing
    if (fs.existsSync(projectLocalDirectory)) {
      if (isDev) throw new Error('Cannot create project - already exists')
      fs.rmSync(projectLocalDirectory)
    }

    const existingPackResult = await this.Model.findOne({
      where: {
        name: data.name
      }
    })
    if (existingPackResult != null) await this.remove(existingPackResult.id, params)

    const git = useGit()
    const response = await new Promise((resolve) => {
      git.clone(data.url, projectLocalDirectory, [], resolve)
    })

    console.log(response)

    // console.log('Installing project from ', data.uploadURL, 'with manifest.json', data)

    // upload files - TODO: replace with git integration
    const files = getFilesRecursive(projectLocalDirectory)
    files.forEach((file) => {
      uploadPromises.push(
        new Promise(async (resolve) => {
          const fileResult = fs.readFileSync(file)
          await storageProvider.putObject({
            Body: fileResult,
            ContentType: getContentType(file),
            Key: `project/${data.name}/${path}`
          })
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
      storageProviderPath: `https://${storageProvider.cacheDomain}/project/${data.name}/`,
      repositoryPath: data.url
    }

    await super.create(dbEntryData, params)
    // TODO: trigger re-build
    await Promise.all(uploadPromises)
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
  async get(name: string, params: Params) {
    const metadataPath = path.resolve(__dirname, `../../../../projects/projects/${name}/package.json`)
    if (fs.existsSync(metadataPath)) {
      try {
        const json: ProjectInterface = JSON.parse(fs.readFileSync(metadataPath, 'utf8')).xrengine
        json.name = name
        if (isDev) {
          const remoteURL = getRemoteURLFromGitData(name)
          json.repositoryPath = remoteURL
        } else {
          const data = (await super.get(name, params)) as ProjectInterface
          json.repositoryPath = data.repositoryPath
          json.storageProviderPath = data.storageProviderPath
        }
        return json
      } catch (e) {
        console.warn('[getProjects]: Failed to read manifest.json for project', name, 'with error', e)
        return
      }
    }
    return null
  }

  /**
   * Gets the metadata from the local fs
   *
   * @param params
   * @returns
   */
  async find(params: Params) {
    return fs
      .readdirSync(path.resolve(__dirname, '../../../../projects/projects/'), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .map(async (name) => {
        try {
          const json: ProjectInterface = JSON.parse(
            fs.readFileSync(path.resolve(__dirname, '../../../../projects/projects/' + name + '/package.json'), 'utf8')
          ).xrengine
          json.name = name
          if (isDev) {
            const remoteURL = getRemoteURLFromGitData(name)
            json.repositoryPath = remoteURL
          } else {
            const data = (await super.get(name, params)) as ProjectInterface
            json.repositoryPath = data.repositoryPath
            json.storageProviderPath = data.storageProviderPath
          }
          console.log(json)
          return json
        } catch (e) {
          console.warn('[getProjects]: Failed to read manifest.json for project', name, 'with error', e)
          return
        }
      })
      .filter((val) => val !== undefined)
  }
}
