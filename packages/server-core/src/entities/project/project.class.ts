import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Id, Params } from '@feathersjs/feathers'
import { getAxiosConfig, getContentType, populateProject } from '../content-pack/content-pack-helper'
import axios from 'axios'
import { ProjectInterface, ProjectManifestInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
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

    // Add to DB
    const dbEntryData: ProjectInterface = {
      ...manifestData,
      storageProviderPath: `https://${storageProvider.cacheDomain}/project/${data.name}/`,
      sourcePath: data.url
    }

    await super.create(dbEntryData, params)
    // TODO: trigger re-build
    await Promise.all(uploadPromises)
  }

  async remove(id: Id, params: Params) {
    try {
      // we dont want to remove projects for local development, as this is handled manually for now,
      // and could be done by accident to which code could be lost
      // if(!isDev) {
      //   const { name } = await super.get(id, params)
      //   const manifestPath = path.resolve(__dirname, `../../../../projects/projects/${name}/manifest.json`)
      //   fs.rmSync(manifestPath)
      // }
      if (!isDev) await super.remove(id, params)
      // TODO: trigger re-build
    } catch (e) {
      console.log(`[Projects]: failed to remove project ${id}`, e)
      return false
    }
    return true
  }

  /**
   * Gets the manifest from the storage provider
   *
   * @param id
   * @param params
   * @returns
   */
  async get(name: string, params: Params) {
    const manifestPath = path.resolve(__dirname, `../../../../projects/projects/${name}/manifest.json`)
    if (fs.existsSync(manifestPath)) {
      try {
        const json: ProjectInterface = JSON.parse(
          fs.readFileSync(path.resolve(__dirname, '../../../../projects/projects/' + name + '/manifest.json'), 'utf8')
        )
        json.name = name
        if (isDev) {
          const remoteURL = getRemoteURLFromGitData(name)
          json.sourceManifest = remoteURL
        } else {
          const data = (await super.get(name, params)) as ProjectInterface
          json.sourceManifest = data.sourceManifest
          json.storageProviderManifest = data.storageProviderManifest
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
   *
   * @param params
   * @returns
   */
  async find(params: Params) {
    const dbEntries = ((await super.find(params)) as any).data as ProjectInterface[]
    console.log(dbEntries)
    return fs
      .readdirSync(path.resolve(__dirname, '../../../../projects/projects/'), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => dirent.name)
      .map((dir) => {
        try {
          const json: ProjectInterface = JSON.parse(
            fs.readFileSync(path.resolve(__dirname, '../../../../projects/projects/' + dir + '/manifest.json'), 'utf8')
          )
          json.name = dir
          const remoteURL = getRemoteURLFromGitData(dir)
          json.sourceManifest = remoteURL
          return json
        } catch (e) {
          console.warn('[getProjects]: Failed to read manifest.json for project', dir, 'with error', e)
          return
        }
      })
      .filter((val) => val !== undefined)
  }
}
