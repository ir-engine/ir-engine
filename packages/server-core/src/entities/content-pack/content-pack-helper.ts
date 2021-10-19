import { Application } from '../../../declarations'
import config from '../../appconfig'
import axios, { AxiosRequestConfig } from 'axios'
import mimeType from 'mime-types'
import { useStorageProvider } from '../../media/storageprovider/storageprovider'
import { Agent } from 'https'
import { Params } from '@feathersjs/feathers'
import { ProjectInterface } from '@xrengine/common/src/interfaces/ProjectInterface'

const storageProvider = useStorageProvider()
const urlRegex = /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_.~#?&//=]*)$/
const thumbnailRegex = /([a-zA-Z0-9_-]+).jpeg/
const avatarRegex = /avatars\/([a-zA-Z0-9_-]+).([a-zA-Z0-9_-]+)/

const getAssetKey = (value: string, packName: string) => `content-pack/${packName}/assets/${value}`
const getAssetS3Key = (value: string) => value.replace('/assets', '')

const getAvatarKey = (packName: string, key: string) => `content-pack/${packName}/${key}`
const getAvatarThumbnailKey = (packName: string, key: string) => `content-pack/${packName}/${key}`

const getThumbnailKey = (value: string) => {
  const regexExec = thumbnailRegex.exec(value)
  return `${regexExec[0]}`
}

const getAvatarLinkKey = (value: string) => {
  const regexExec = avatarRegex.exec(value)
  return `${regexExec[0]}`
}

export const getContentType = (url: string) => {
  if (/.glb$/.test(url) === true) return 'glb'
  if (/.jpeg$/.test(url) === true) return 'jpeg'
  if (/.json$/.test(url) === true) return 'json'
  if (/.ts$/.test(url) === true) return 'ts'
  if (/.tsx$/.test(url) === true) return 'tsx'
  return 'octet-stream'
}

export function getAxiosConfig(responseType?: string): AxiosRequestConfig {
  const axiosConfig = {
    responseType: responseType === 'json' ? 'json' : 'arraybuffer'
  } as AxiosRequestConfig

  if (config.server.mode === 'local') axiosConfig.httpsAgent = new Agent({ rejectUnauthorized: false })
  return axiosConfig
}

export function assembleScene(scene: any, contentPack: string): any {
  const uploadPromises = []
  const worldFile = {
    version: 4,
    root: scene.entities[0].entityId,
    metadata: JSON.parse(scene.metadata),
    entities: {}
  }
  for (const index in scene.entities) {
    const entity = scene.entities[index] as any
    const patchedComponents = []
    for (const index in entity.components) {
      const component = entity.components[index]
      // eslint-disable-next-line prefer-const
      for (let [key, value] of Object.entries(component.props) as [string, any]) {
        if (typeof value === 'string' && key !== 'link') {
          const regexExec = urlRegex.exec(value)
          if (regexExec != null) {
            const promise = new Promise(async (resolve, reject) => {
              value = regexExec[2] as string
              component.props[key] = `/assets${value}`
              if (value[0] === '/') value = value.slice(1)
              const file = await storageProvider.getObject(value)
              await storageProvider.putObject({
                Body: file.Body,
                ContentType: file.ContentType,
                Key: getAssetKey(value as string, contentPack)
              })

              resolve(null)
            })
            uploadPromises.push(promise)
          }
        }
      }
      const toBePushed = {
        name: component.name,
        props: component.props
      }
      patchedComponents.push(toBePushed)
    }
    worldFile.entities[entity.entityId] = {
      name: entity.name,
      parent: entity.parent,
      index: entity.index,
      components: patchedComponents
    }
  }
  return {
    worldFile,
    uploadPromises
  }
}

export function assembleProject(project: any, contentPack: string): Promise<any> {
  console.log('assembleProject', project, contentPack)
  return new Promise(async (resolve, reject) => {
    try {
      const manifest = await axios.get(project.storageProviderManifest, getAxiosConfig())
      const data = JSON.parse(manifest.data.toString())
      const files = data.files
      const uploadPromises = []
      uploadPromises.push(
        storageProvider.putObject({
          Body: manifest.data,
          ContentType: getContentType(project.storageProviderManifest),
          Key: `content-pack/${contentPack}/project/${project.name}/manifest.json`
        })
      )
      files.forEach((file) => {
        const path = file.replace('./', '')
        const subFileLink = project.storageProviderManifest.replace('manifest.json', path)
        uploadPromises.push(
          new Promise(async (resolve) => {
            const fileResult = await axios.get(subFileLink, getAxiosConfig())
            await storageProvider.putObject({
              Body: fileResult.data,
              ContentType: getContentType(path),
              Key: `content-pack/${contentPack}/project/${project.name}/${path}`
            })
            resolve(true)
          })
        )
      })
      resolve({
        uploadPromises
      })
    } catch (err) {
      reject(err)
    }
  })
}

export async function populateScene(
  sceneId: string,
  scene: any,
  manifestUrl: any,
  app: Application,
  thumbnailUrl?: string
): Promise<any> {
  const promises = []
  const rootPackUrl = manifestUrl.replace('/manifest.json', '')
  const existingSceneResult = await (app.service('collection') as any).Model.findOne({
    where: {
      sid: sceneId
    }
  })
  if (existingSceneResult != null) {
    if (existingSceneResult.thumbnailOwnedFileId != null)
      await app.service('static-resource').remove(existingSceneResult.thumbnailOwnedFileId)
    const entityResult = (await app.service('entity').find({
      query: {
        collectionId: existingSceneResult.id
      }
    })) as any
    await Promise.all(
      entityResult.data.map(async (entity) => {
        await app.service('component').remove(null, {
          where: {
            entityId: entity.id
          }
        })
        return app.service('entity').remove(entity.id)
      })
    )
    await app.service('collection').remove(existingSceneResult.id)
  }
  const collection = await app.service('collection').create({
    sid: sceneId,
    name: scene.metadata.name,
    metadata: scene.metadata,
    version: scene.version,
    isPublic: true,
    type: 'scene'
  })
  if (thumbnailUrl != null) {
    const thumbnailResult = await axios.get(thumbnailUrl, getAxiosConfig())
    const thumbnailKey = getThumbnailKey(thumbnailUrl)
    await storageProvider.putObject({
      Body: thumbnailResult.data,
      ContentType: 'jpeg',
      Key: thumbnailKey
    })
    await app.service('static-resource').create({
      sid: collection.sid,
      url: `https://${storageProvider.cacheDomain}/${thumbnailKey}`,
      mimeType: 'image/jpeg'
    })
    const newStaticResource = await app.service('static-resource').find({
      query: {
        sid: collection.sid,
        mimeType: 'image/jpeg'
      }
    })
    await app.service('static-resource').patch(newStaticResource.data[0].id, {
      key: `${newStaticResource.data[0].id}.jpeg`
    })
    await app.service('collection').patch(collection.id, {
      thumbnailOwnedFileId: newStaticResource.data[0].id
    })
  }
  for (const [key, value] of Object.entries(scene.entities) as [string, any]) {
    const entityResult = await app.service('entity').create({
      entityId: key,
      name: value.name,
      parent: value.parent,
      collectionId: collection.id,
      index: value.index
    })
    value.components.forEach(async (component) => {
      for (const [key, value] of Object.entries(component.props)) {
        if (typeof value === 'string' && /^\/assets/.test(value) === true) {
          component.props[key] = rootPackUrl + value
          // Insert Download/S3 upload
          const contentType = getContentType(component.props[key])
          const downloadResult = await axios.get(component.props[key], getAxiosConfig('json'))
          await storageProvider.putObject({
            Body: downloadResult.data,
            ContentType: contentType,
            Key: getAssetS3Key(value as string)
          })
        }
      }
      await app.service('component').create({
        data: component.props,
        entityId: entityResult.id,
        type: component.name
      })
    })
  }
  return Promise.all(promises)
}

export async function populateAvatar(avatar: any, app: Application): Promise<any> {
  const avatarPromise = new Promise(async (resolve) => {
    const avatarResult = await axios.get(avatar.avatar, getAxiosConfig())
    const avatarKey = getAvatarLinkKey(avatar.avatar)
    await storageProvider.putObject({
      Body: avatarResult.data,
      ContentType: mimeType.lookup(avatarKey) as string,
      Key: avatarKey
    })
    const existingAvatarResult = await (app.service('static-resource') as any).Model.findOne({
      where: {
        name: avatar.name,
        staticResourceType: 'avatar'
      }
    })
    if (existingAvatarResult != null) await app.service('static-resource').remove(existingAvatarResult.id)
    await app.service('static-resource').create({
      name: avatar.name,
      url: `https://${storageProvider.cacheDomain}/${avatarKey}`,
      key: avatarKey,
      staticResourceType: 'avatar'
    })
    resolve(true)
  })
  const thumbnailPromise = new Promise(async (resolve) => {
    const thumbnailResult = await axios.get(avatar.thumbnail, getAxiosConfig())
    const thumbnailKey = getAvatarLinkKey(avatar.thumbnail)
    await storageProvider.putObject({
      Body: thumbnailResult.data,
      ContentType: mimeType.lookup(thumbnailKey) as string,
      Key: thumbnailKey
    })
    const existingThumbnailResult = await (app.service('static-resource') as any).Model.findOne({
      where: {
        name: avatar.name,
        staticResourceType: 'user-thumbnail'
      }
    })
    if (existingThumbnailResult != null) await app.service('static-resource').remove(existingThumbnailResult.id)
    await app.service('static-resource').create({
      name: avatar.name,
      url: `https://${storageProvider.cacheDomain}/${thumbnailKey}`,
      key: thumbnailKey,
      staticResourceType: 'user-thumbnail'
    })
    resolve(true)
  })
  return Promise.all([avatarPromise, thumbnailPromise])
}

export async function uploadAvatar(avatar: any, thumbnail: any, contentPack: string): Promise<any> {
  if (avatar.url[0] === '/') {
    const protocol = config.noSSL === true ? 'http://' : 'https://'
    const domain = 'localhost:3000'
    avatar.url = new URL(avatar.url, protocol + domain).href
  }
  if (thumbnail.url[0] === '/') {
    const protocol = config.noSSL === true ? 'http://' : 'https://'
    const domain = 'localhost:3000'
    thumbnail.url = new URL(thumbnail.url, protocol + domain).href
  }
  const avatarUploadPromise = new Promise(async (resolve, reject) => {
    try {
      const avatarResult = await axios.get(avatar.url, getAxiosConfig())
      await storageProvider.putObject({
        Body: avatarResult.data,
        ContentType: mimeType.lookup(avatar.url) as string,
        Key: getAvatarKey(contentPack, avatar.key)
      })
      resolve(true)
    } catch (err) {
      console.error(err)
      reject(err)
    }
  })
  const avatarThumbnailUploadPromise = new Promise(async (resolve, reject) => {
    try {
      const avatarThumbnailResult = await axios.get(thumbnail.url, getAxiosConfig())
      await storageProvider.putObject({
        Body: avatarThumbnailResult.data,
        ContentType: mimeType.lookup(thumbnail.url) as string,
        Key: getAvatarThumbnailKey(contentPack, thumbnail.key)
      })
      resolve(true)
    } catch (err) {
      console.error(err)
      reject(err)
    }
  })
  return Promise.all([avatarUploadPromise, avatarThumbnailUploadPromise])
}

/**
 *
 * @param project
 * @param project.name name of the project
 * @param project.manifest manifest.json URL
 * @param app
 * @param params
 */

export async function populateProject(
  project: { name: string; manifest: string },
  app: Application,
  params: Params
): Promise<any> {
  // const uploadPromises = []
  // const existingPackResult = await (app.service('project') as any).Model.findOne({
  //   where: {
  //     name: project.name
  //   }
  // })
  // if (existingPackResult != null) await app.service('project').remove(existingPackResult.id, params)
  // const manifestStream = await axios.get(project.manifest, getAxiosConfig())
  // const manifestData = JSON.parse(manifestStream.data.toString()) as ProjectInterface
  // console.log('Installing project from ', project.manifest, 'with manifest.json', manifestData)
  // const files = manifestData.files
  // uploadPromises.push(
  //   storageProvider.putObject({
  //     Body: manifestStream.data,
  //     ContentType: getContentType(project.manifest),
  //     Key: `project/${manifestData.name}/manifest.json`
  //   })
  // )
  // files.forEach((file) => {
  //   const path = file.replace('./', '')
  //   const subFileLink = project.manifest.replace('manifest.json', path)
  //   uploadPromises.push(
  //     new Promise(async (resolve) => {
  //       const fileResult = await axios.get(subFileLink, getAxiosConfig())
  //       await storageProvider.putObject({
  //         Body: fileResult.data,
  //         ContentType: getContentType(path),
  //         Key: `project/${manifestData.name}/${path}`
  //       })
  //       resolve(true)
  //     })
  //   )
  // })
  // await app.service('project').create(
  //   {
  //     storageProviderManifest: `https://${storageProvider.cacheDomain}/project/${manifestData.name}/manifest.json`,
  //     sourceManifest: project.manifest,
  //     localManifest: `/projects/projects/${manifestData.name}/manifest.json`,
  //     global: false,
  //     name: manifestData.name
  //   },
  //   params
  // )
  // await Promise.all(uploadPromises)
  if (app.k8DefaultClient) {
    try {
      console.log('Attempting to reload k8s clients!')
      const restartClientsResponse = await app.k8DefaultClient.patch(
        `deployment/${config.server.releaseName}-builder-xrengine-builder`,
        {
          spec: {
            template: {
              metadata: {
                annotations: {
                  'kubectl.kubernetes.io/restartedAt': new Date().toISOString()
                }
              }
            }
          }
        }
      )
      console.log('restartClientsResponse', restartClientsResponse)
    } catch (e) {
      console.log(e)
    }
  }
}
