import { Service, SequelizeServiceOptions } from 'feathers-sequelize'
import { Application } from '../../../declarations'
import { Id, Params } from '@feathersjs/feathers'
import { getAxiosConfig, getContentType, populateProject } from '../content-pack/content-pack-helper'
import axios from 'axios'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'
import { ProjectDBEntryInterface } from '@xrengine/common/src/interfaces/ProjectDBEntryInterface'
import fs from 'fs'
import path from 'path'
import { isDev } from '@xrengine/common/src/utils/isDev'
import StorageProvider from '../../media/storageprovider/storageprovider'

const storageProvider = new StorageProvider()

export class Project extends Service {
  app: Application
  docs: any

  constructor(options: Partial<SequelizeServiceOptions>, app: Application) {
    super(options)
    this.app = app
  }

  /**
   * Creates a new project
   *  - puts a new entry in the db
   *  - downloads data from upload url into fs
   *  - uploads data to the storage provider
   * @param app
   * @returns
   */
  async create(data: { uploadURL: string }, params: Params) {
    const uploadPromises = []

    const manifestStream = await axios.get(data.uploadURL, getAxiosConfig())
    const manifestData = JSON.parse(manifestStream.data.toString()) as ProjectInterface

    const existingPackResult = await this.Model.findOne({
      where: {
        name: manifestData.name
      }
    })
    if (existingPackResult != null) await this.remove(existingPackResult.id, params)

    console.log('Installing project from ', data.uploadURL, 'with manifest.json', manifestData)

    // upload files - TODO: replace with git integration
    const files = manifestData.files
    uploadPromises.push(
      storageProvider.putObject({
        Body: manifestStream.data,
        ContentType: getContentType(data.uploadURL),
        Key: `project/${manifestData.name}/manifest.json`
      })
    )
    files.forEach((file) => {
      const path = file.replace('./', '')
      const subFileLink = data.uploadURL.replace('manifest.json', path)
      uploadPromises.push(
        new Promise(async (resolve) => {
          const fileResult = await axios.get(subFileLink, getAxiosConfig())
          await storageProvider.putObject({
            Body: fileResult.data,
            ContentType: getContentType(path),
            Key: `project/${manifestData.name}/${path}`
          })
          resolve(true)
        })
      )
    })

    // TODO: populate avatars & scenes

    // Add to DB
    const dbEntryData: ProjectDBEntryInterface = {
      storageProviderManifest: `https://${storageProvider.provider.cacheDomain}/project/${manifestData.name}/manifest.json`,
      sourceManifest: data.uploadURL,
      global: false,
      name: manifestData.name
    } as any

    await super.create(dbEntryData, params)
    await Promise.all(uploadPromises)
  }

  async remove(id: Id, params: Params) {
    try {
      const { name } = await super.get(id, params)
      const manifestPath = path.resolve(__dirname, `../../../../projects/project/${name}/manifest.json`)
      fs.rmSync(manifestPath)
      await super.remove(id, params)
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
    const manifestPath = path.resolve(__dirname, `../../../../projects/project/${name}/manifest.json`)
    if (fs.existsSync(manifestPath)) {
      try {
        const json: ProjectInterface = JSON.parse(
          fs.readFileSync(path.resolve(__dirname, '../../../../projects/projects/' + name + '/manifest.json'), 'utf8')
        )
        json.name = name
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
          return json
        } catch (e) {
          console.warn('[getProjects]: Failed to read manifest.json for project', dir, 'with error', e)
          return
        }
      })
      .filter((val) => val !== undefined)
  }
}
