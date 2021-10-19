import { Id, NullableId, Params, ServiceMethods } from '@feathersjs/feathers'
import Paginated from '../../types/PageObject'
import { Application } from '../../../declarations'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import {
  assembleScene,
  getAxiosConfig,
  populateAvatar,
  populateScene,
  uploadAvatar,
  assembleProject,
  populateProject
} from './content-pack-helper'
import config from '../../appconfig'
import axios from 'axios'
import { StorageListObjectInterface, StorageObjectInterface } from '../..'

interface Data {}

interface ServiceOptions {}
const storageProvider = useStorageProvider()
const packRegex = /content-pack\/([a-zA-Z0-9_-]+)\/manifest.json/
const thumbnailRegex = /([a-zA-Z0-9_-]+).jpeg/

const getManifestKey = (packName: string) => `content-pack/${packName}/manifest.json`
const getWorldFileKey = (packName: string, name: string) => `content-pack/${packName}/world/${name}.world`
const getWorldFileUrl = (packName: string, uuid: string) =>
  `https://${storageProvider.cacheDomain}/content-pack/${packName}/world/${uuid}.world`
const getThumbnailKey = (packName: string, url: string) => {
  const uuidRegexExec = thumbnailRegex.exec(url)
  return `content-pack/${packName}/img/${uuidRegexExec[1]}.jpeg`
}
const getThumbnailUrl = (packName: string, url: string) => {
  const uuidRegexExec = thumbnailRegex.exec(url)
  return `https://${storageProvider.cacheDomain}/content-pack/${packName}/img/${uuidRegexExec[1]}.jpeg`
}
const getAvatarUrl = (packName: string, avatar: any) =>
  `https://${storageProvider.cacheDomain}/content-pack/${packName}/${avatar.key}`
const getAvatarThumbnailUrl = (packName: string, thumbnail: any) =>
  `https://${storageProvider.cacheDomain}/content-pack/${packName}/${thumbnail.key}`

const getProjectManifestUrl = (packName: string, project: any) =>
  `https://${storageProvider.cacheDomain}/content-pack/${packName}/project/${project.name}/manifest.json`
const getProjectManifestKey = (packName: string, project: any) =>
  `/content-pack/${packName}/project/${project.name}/manifest.json`

/**
 * A class for Upload Media service
 *
 * @author Vyacheslav Solovjov
 */
export class ContentPack implements ServiceMethods<Data> {
  app: Application
  options: ServiceOptions

  constructor(options: ServiceOptions = {}, app: Application) {
    this.options = options
    this.app = app
  }

  async setup() {}

  async find(params?: Params): Promise<any[] | Paginated<any>> {
    const result = (await new Promise((resolve, reject) => {
      storageProvider
        .listObjects('content-pack')
        .then((data) => {
          resolve(data)
        })
        .catch((err) => {
          console.error(err)
          reject(err)
        })
    })) as StorageListObjectInterface
    const manifests = result.Contents.filter((result) => packRegex.exec(result.Key) != null)
    return Promise.all(
      manifests.map(async (manifest) => {
        const manifestResult = (await new Promise((resolve, reject) => {
          storageProvider
            .getObject(manifest.Key)
            .then((data) => {
              resolve(data)
            })
            .catch((err) => {
              console.error(err)
              reject(err)
            })
        })) as StorageObjectInterface
        return {
          name: packRegex.exec(manifest.Key)[1],
          url: `https://${storageProvider.cacheDomain}/${manifest.Key}`,
          data: JSON.parse(manifestResult.Body.toString())
        }
      })
    )
  }

  async get(id: Id, params?: Params): Promise<Data> {
    return {}
  }

  async create(data: Data, params?: Params): Promise<Data> {
    if (Array.isArray(data)) {
      return await Promise.all(data.map((current) => this.create(current, params)))
    }

    let uploadPromises = []
    const { scenes, contentPack, avatars, projects } = data as any
    await storageProvider.checkObjectExistence(getManifestKey(contentPack))
    const body = {
      version: 1,
      avatars: [],
      scenes: [],
      projects: []
    }
    const promises = []
    console.log('incoming projects', projects)
    if (scenes != null) {
      for (const scene of scenes) {
        promises.push(
          new Promise(async (resolve) => {
            const thumbnailFind = await this.app.service('static-resource').find({
              query: {
                sid: scene.sid
              }
            })

            const assembleResponse = assembleScene(scene, contentPack)
            const worldFile = assembleResponse.worldFile
            uploadPromises = assembleResponse.uploadPromises
            if (typeof worldFile.metadata === 'string') worldFile.metadata = JSON.parse(worldFile.metadata)
            const worldFileKey = getWorldFileKey(contentPack, worldFile.metadata.name)
            let thumbnailLink
            if (thumbnailFind.total > 0) {
              const thumbnail = thumbnailFind.data[0]
              const url = thumbnail.url
              const thumbnailDownload = await axios.get(url, getAxiosConfig())
              await storageProvider.putObject({
                Body: thumbnailDownload.data,
                ContentType: 'jpeg',
                Key: getThumbnailKey(contentPack, url)
              })
              thumbnailLink = getThumbnailUrl(contentPack, url)
            }
            await storageProvider.putObject({
              Body: Buffer.from(JSON.stringify(worldFile)),
              ContentType: 'application/json',
              Key: worldFileKey
            })
            const newScene = {
              sid: scene.sid,
              name: scene.name,
              worldFile: getWorldFileUrl(contentPack, worldFile.metadata.name)
            }
            if (thumbnailLink != null) (newScene as any).thumbnail = thumbnailLink
            body.scenes.push(newScene)
            resolve(true)
          })
        )
      }
    }
    if (avatars != null) {
      for (const avatarItem of avatars) {
        promises.push(
          new Promise(async (resolve) => {
            const { avatar, thumbnail } = avatarItem
            await uploadAvatar(avatar, thumbnail, contentPack)
            const newAvatar = {
              name: avatar.name,
              avatar: getAvatarUrl(contentPack, avatar),
              thumbnail: getAvatarThumbnailUrl(contentPack, thumbnail)
            }
            body.avatars.push(newAvatar)
            resolve(true)
          })
        )
      }
    }
    if (projects != null) {
      for (const project of projects) {
        const newProject = {
          name: project.name,
          manifest: getProjectManifestUrl(contentPack, project)
        }
        promises.push(
          new Promise(async (resolve) => {
            const assembleResponse = await assembleProject(project, contentPack)
            uploadPromises = assembleResponse.uploadPromises
            resolve(true)
          })
        )
        body.projects.push(newProject)
      }
    }

    await Promise.all(promises)
    await storageProvider.putObject({
      Body: Buffer.from(JSON.stringify(body)),
      ContentType: 'application/json',
      Key: getManifestKey(contentPack)
    })
    await Promise.all(uploadPromises)
    return data
  }

  async update(id: NullableId, data: Data, params?: Params): Promise<Data> {
    const manifestUrl = (data as any).manifestUrl
    const manifestResult = await axios.get(manifestUrl, getAxiosConfig('json'))
    const { avatars, scenes, projects } = manifestResult.data
    const promises = []
    for (const index in scenes) {
      const scene = scenes[index]
      const sceneResult = await axios.get(scene.worldFile, getAxiosConfig('json'))
      promises.push(populateScene(scene.sid, sceneResult.data, manifestUrl, this.app, scene.thumbnail))
    }
    for (const index in avatars) promises.push(populateAvatar(avatars[index], this.app))
    for (const index in projects) promises.push(populateProject(projects[index].manifest, this.app, params))
    await Promise.all(promises)
    return data
  }

  async patch(id: NullableId, data: Data, params?: Params): Promise<Data> {
    let uploadPromises = []
    const { scenes, contentPack, avatars, projects } = data as any
    const pack = await storageProvider.getObject(getManifestKey(contentPack))
    const body = JSON.parse((pack as any).Body.toString())
    const invalidationItems = [`/content-pack/${contentPack}/manifest.json`]
    const promises = []
    if (scenes != null) {
      for (const scene of scenes) {
        promises.push(
          new Promise(async (resolve) => {
            const thumbnailFind = await this.app.service('static-resource').find({
              query: {
                sid: scene.sid
              }
            })

            const assembleResponse = assembleScene(scene, contentPack)
            const worldFile = assembleResponse.worldFile
            uploadPromises = assembleResponse.uploadPromises
            if (typeof worldFile.metadata === 'string') worldFile.metadata = JSON.parse(worldFile.metadata)
            const worldFileKey = getWorldFileKey(contentPack, worldFile.metadata.name)
            invalidationItems.push(`/${worldFileKey}`)
            let thumbnailLink
            if (thumbnailFind.total > 0) {
              const thumbnail = thumbnailFind.data[0]
              const url = thumbnail.url
              const thumbnailDownload = await axios.get(url, getAxiosConfig())
              const thumbnailKey = getThumbnailKey(contentPack, url)
              await storageProvider.putObject({
                Body: thumbnailDownload.data,
                ContentType: 'jpeg',
                Key: thumbnailKey
              })
              thumbnailLink = getThumbnailUrl(contentPack, url)
              invalidationItems.push(`/${thumbnailKey}`)
            }
            await storageProvider.putObject({
              Body: Buffer.from(JSON.stringify(worldFile)),
              ContentType: 'application/json',
              Key: worldFileKey
            })
            body.scenes = body.scenes.filter((existingScene) => existingScene.sid !== scene.sid)
            const newScene = {
              sid: scene.sid,
              name: scene.name,
              worldFile: getWorldFileUrl(contentPack, worldFile.metadata.name)
            }
            if (thumbnailLink != null) (newScene as any).thumbnail = thumbnailLink
            body.scenes.push(newScene)
            resolve(true)
          })
        )
      }
    } else if (avatars != null) {
      for (const avatarItem of avatars) {
        promises.push(
          new Promise(async (resolve) => {
            const { avatar, thumbnail } = avatarItem
            await uploadAvatar(avatar, thumbnail, contentPack)
            body.avatars = body.avatars.filter((existingAvatar) => existingAvatar.name !== avatar.name)
            const newAvatar = {
              name: avatar.name,
              avatar: getAvatarUrl(contentPack, avatar),
              thumbnail: getAvatarThumbnailUrl(contentPack, thumbnail)
            }
            invalidationItems.push(`/content-pack/${contentPack}/avatars/${avatar.name}.*`)
            body.avatars.push(newAvatar)
            resolve(true)
          })
        )
      }
    } else if (projects != null) {
      if (body.projects == null) body.projects = []
      for (const project of projects) {
        body.projects = body.projects.filter((existingProject) => existingProject.name !== project.name)
        const newProject = {
          name: project.name,
          manifest: getProjectManifestUrl(contentPack, project)
        }
        invalidationItems.push(getProjectManifestKey(contentPack, project))
        promises.push(
          new Promise(async (resolve) => {
            const assembleResponse = await assembleProject(project, contentPack)
            uploadPromises = assembleResponse.uploadPromises
            resolve(true)
          })
        )
        body.projects.push(newProject)
      }
    }

    await Promise.all(promises)
    if (body.version) body.version++
    else body.version = 1
    await storageProvider.putObject({
      Body: Buffer.from(JSON.stringify(body)),
      ContentType: 'application/json',
      Key: getManifestKey(contentPack)
    })
    await Promise.all(uploadPromises)
    if (config.server.storageProvider === 'aws') await storageProvider.createInvalidation(invalidationItems)
    return data
  }

  async remove(id: NullableId, params?: Params): Promise<Data> {
    return { id }
  }
}
