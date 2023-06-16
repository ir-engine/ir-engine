import { createHash } from 'crypto'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import { Op } from 'sequelize'

import { UploadFile } from '@etherealengine/common/src/interfaces/UploadAssetInterface'
import { VolumetricInterface } from '@etherealengine/common/src/interfaces/VolumetricInterface'
import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { downloadResourceAndMetadata, getExistingResource } from '../static-resource/static-resource-helper'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { addAssetAsStaticResource, getFileMetadata, UploadAssetArgs } from '../upload-asset/upload-asset.service'
import { videoUploadFile } from '../video/video-upload.helper'

const uvolMimetype = 'application/octet-stream'

const handleManifest = async (
  app: Application,
  project: string,
  url: string,
  name = 'untitled',
  volumetricId: string
) => {
  const drcsFileHead = await fetch(url, { method: 'HEAD' })
  if (!/^[23]/.test(drcsFileHead.status.toString())) throw new Error('Invalid URL')
  const contentLength = drcsFileHead.headers['content-length'] || drcsFileHead.headers.get('content-length')
  if (!name) name = url.split('/').pop()!.split('.')[0]
  if (/.LOD0/.test(name)) name = name.replace('.LOD0', '')
  const hash = createHash('sha3-256').update(contentLength).update(name).digest('hex')
  let existingData

  let existingResource = await app.service('static-resource').Model.findOne({
    where: {
      hash
    }
  })
  if (existingResource) {
    existingData = await app.service('data').Model.findOne({
      where: {
        [Op.or]: [
          {
            staticResourceId: {
              [Op.eq]: existingResource.id
            }
          }
        ],
        project
      },
      include: [
        {
          model: app.service('static-resource').Model,
          as: 'staticResource'
        }
      ]
    })
  }

  if (existingResource && existingData) return existingData

  if (!existingResource) {
    let files: UploadFile[]
    if (/http(s)?:\/\//.test(url)) {
      if (config.server.cloneProjectStaticResources) {
        const file = await fetch(url)
        files = [
          {
            buffer: Buffer.from(await file.arrayBuffer()),
            originalname: name,
            mimetype: uvolMimetype,
            size: parseInt(file.headers.get('content-length') || file.headers.get('Content-Length') || '0')
          }
        ]
      } else {
        // otherwise we just return the url and let the client download it as needed
        const file = await fetch(url, { method: 'HEAD' })
        files = [
          {
            buffer: url,
            originalname: name,
            mimetype:
              file.headers.get('content-type') || file.headers.get('Content-Type') || 'application/octet-stream',
            size: parseInt(file.headers.get('content-length') || file.headers.get('Content-Length') || '0')
          }
        ]
      }
    } else {
      const file = fs.readFileSync(url)
      return [
        {
          buffer: file,
          originalname: name,
          mimetype: uvolMimetype,
          size: file.length
        }
      ]
    }
    const key = `static-resources/volumetric/${volumetricId}/${name}`
    existingResource = await addAssetAsStaticResource(app, files, {
      hash: hash,
      path: `${key}.manifest`,
      staticResourceType: 'data',
      project
    })
  }
  return app.service('data').create({
    staticResourceId: existingResource.id
  })
}

export const addVolumetricAssetFromProject = async (
  app: Application,
  urls: string[],
  project: string,
  download = config.server.cloneProjectStaticResources
) => {
  const storageProvider = getStorageProvider()
  const mainURL = urls[0]
  const root = mainURL
    .replace(/.drcs$/, '')
    .replace(/.mp4$/, '')
    .replace(/.manifest$/, '')
  const name = root.split('/').pop()
  const drcsUrl = `${root}.drcs`
  const videoUrl = `${root}.mp4`
  const manifestUrl = `${root}.manifest`

  const fromStorageProvider = drcsUrl.split(path.join(storageProvider.cacheDomain, 'projects/'))
  const isExternalToProject =
    !project || fromStorageProvider.length === 1 || project !== fromStorageProvider?.[1]?.split('/')?.[0]

  const drcsMetadata = await getFileMetadata({ file: drcsUrl })
  const existingVolumetric = await getExistingResource<VolumetricInterface>(
    app,
    'volumetric',
    drcsMetadata.hash,
    project
  )
  if (existingVolumetric) return existingVolumetric

  const videoMetadata = await getFileMetadata({ file: videoUrl })
  const manifestMetadata = await getFileMetadata({ file: manifestUrl })

  const files = await Promise.all(
    urls.map((url) => downloadResourceAndMetadata(url, isExternalToProject ? download : false))
  )

  const key = isExternalToProject ? `static-resources/${project}/` : `projects/${project}/assets/`

  const drcsResource = await addAssetAsStaticResource(app, files, {
    hash: drcsMetadata.hash,
    path: key,
    staticResourceType: 'volumetric',
    project
  })
  const videoResource = await addAssetAsStaticResource(app, files, {
    hash: videoMetadata.hash,
    path: key,
    staticResourceType: 'video',
    project
  })
  const manifestResource = await addAssetAsStaticResource(app, files, {
    hash: manifestMetadata.hash,
    path: key,
    staticResourceType: 'data',
    project
  })

  console.log({
    name: drcsMetadata.assetName,
    staticResourceId: drcsResource.id
  })

  return (await app.service('volumetric').create({
    name: drcsMetadata.assetName,
    // video is what goes in scene json, as that is what the player expects
    staticResourceId: videoResource.id
    // other assets can be retrieved as 'dependencies' via static resource query
  })) as VolumetricInterface
}

export const volumetricUploadFile = async (app: Application, data: UploadAssetArgs) => {
  logger.info('audioUploadFile: %o', data)

  //TODO

  // const path = data.name
  // const mainURL = data.files[0].
  //   .url!.replace(/.drcs$/, '')
  //   .replace(/.mp4$/, '')
  //   .replace(/.manifest$/, '')
  // const drcsUrl = `${path}/${mainURL}.drcs`

  // const { assetName, hash } = await getFileMetadata({
  //   file: drcsUrl,
  //   name: data.files[0].originalname
  // })

  // const existingAudio = await getExistingResource<VolumetricInterface>(app, 'volumetric', hash, data.project)
  // if (existingAudio) return existingAudio

  // const stats = await getAudioStats(data.files[0].buffer)

  // const key = `/temp/${hash}`
  // const resource = await addAssetAsStaticResource(app, data.files, {
  //   hash: hash,
  //   path: key,
  //   staticResourceType: 'volumetric',
  //   stats,
  //   project: data.project
  // })

  // return (await app.service('volumetric').create({
  //   duration: stats.duration * 1000,
  //   name: assetName,
  //   staticResourceId: resource.id
  // })) as VolumetricInterface
}

// export const volumetricUploadFile = async (app: Application, data: UploadAssetArgs) => {

//   try {
//     const project = data.project
//     const root = data
//       .url!.replace(/.drcs$/, '')
//       .replace(/.mp4$/, '')
//       .replace(/.manifest$/, '')
//     const name = root.split('/').pop()
//     const videoUrl = `${root}.mp4`
//     const drcsUrl = `${root}.drcs`
//     const manifestUrl = `${root}.manifest`
//     // console.log('urls', videoUrl, drcsUrl, manifestUrl)
//     let volumetricEntry, video, manifest
//     let drcsFileHead, contentLength
//     if (/http(s)?:\/\//.test(drcsUrl)) {
//       drcsFileHead = await fetch(drcsUrl, { method: 'HEAD' })
//       if (!/^[23]/.test(drcsFileHead.status.toString())) throw new Error('Invalid URL')
//       contentLength = drcsFileHead.headers['content-length'] || drcsFileHead.headers?.get('content-length')
//     } else {
//       drcsFileHead = await fs.statSync(drcsUrl)
//       contentLength = drcsFileHead.size.toString()
//     }
//     if (!data.name) data.name = data.url!.split('/').pop()!.split('.')[0]
//     const hash = createHash('sha3-256').update(contentLength).update(data.name).digest('hex')
//     const extension = drcsUrl.split('.').pop()
//     let drcs = await app.service('static-resource').Model.findOne({
//       where: {
//         hash
//       }
//     })
//     if (!drcs) {
//       let file, body
//       if (/http(s)?:\/\//.test(drcsUrl)) {
//         file = await fetch(drcsUrl)
//         body = Buffer.from(await file.arrayBuffer())
//       } else body = fs.readFileSync(drcsUrl)
//       volumetricEntry = await app.service('volumetric').create({})
//       const key = `static-resources/volumetric/${volumetricEntry.id}/${name}`
//       drcs = await addAssetAsStaticResource(app, body, {
//         hash: hash,
//         path: `${key}.${extension}`,
//         staticResourceType: 'volumetric',
//         project,
//         stats: {
//           size: contentLength
//         }
//       })
//     } else {
//       volumetricEntry = await app.service('volumetric').Model.findOne({
//         where: {
//           [Op.or]: [
//             {
//               drcsStaticResourceId: {
//                 [Op.eq]: drcs.id
//               }
//             }
//           ],
//           project
//         }
//       })
//       if (!volumetricEntry)
//         volumetricEntry = await app.service('volumetric').create({
//           drcsStaticResourceId: drcs.id
//         })
//     }
//     ;[video, manifest] = await Promise.all([
//       videoUpload(app, { url: videoUrl, name, project }, volumetricEntry.id, 'volumetric'),
//       handleManifest(app, project, manifestUrl, name, volumetricEntry.id)
//     ])
//     await app.service('volumetric').patch(volumetricEntry.id, {
//       drcsStaticResourceId: drcs.id,
//       videoId: video.id,
//       manifestId: manifest.id
//     })
//     const vol = await app.service('volumetric').Model.findOne({
//       where: {
//         id: volumetricEntry.id,
//         project
//       }
//     })
//     // Initially, the population of child tables was just done with includes, but this led to more than the max 61
//     // table joins some versions of SQL, like MariaDB, can do at once. The child fetches are now done individually
//     // to avoid this limit
//     const promises = [] as Promise<void>[]
//     if (vol.drcsStaticResourceId)
//       promises.push(
//         new Promise(async (resolve, reject) => {
//           try {
//             vol.dataValues.drcsStaticResource = await app.service('static-resource').Model.findOne({
//               where: {
//                 id: vol.drcsStaticResourceId,
//                 project
//               }
//             })
//             resolve()
//           } catch (err) {
//             reject(err)
//           }
//         })
//       )
//     if (vol.uvolStaticResourceId)
//       promises.push(
//         new Promise(async (resolve, reject) => {
//           try {
//             vol.dataValues.uvolStaticResource = await app.service('static-resource').Model.findOne({
//               where: {
//                 id: vol.uvolStaticResourceId,
//                 project
//               }
//             })
//             resolve()
//           } catch (err) {
//             reject(err)
//           }
//         })
//       )
//     if (vol.manifestId)
//       promises.push(
//         new Promise(async (resolve, reject) => {
//           try {
//             vol.dataValues.manifest = await app.service('data').Model.findOne({
//               where: {
//                 id: vol.manifestId,
//                 project
//               },
//               include: [
//                 {
//                   model: app.service('static-resource').Model,
//                   as: 'staticResource'
//                 }
//               ]
//             })
//             resolve()
//           } catch (err) {
//             reject(err)
//           }
//         })
//       )
//     if (vol.thumbnailId)
//       promises.push(
//         new Promise(async (resolve, reject) => {
//           try {
//             vol.dataValues.thumbnail = await app.service('image').Model.findOne({
//               where: {
//                 id: vol.thumbnailId,
//                 project
//               },
//               include: [
//                 {
//                   model: app.service('static-resource').Model,
//                   as: 'pngStaticResource'
//                 },
//                 {
//                   model: app.service('static-resource').Model,
//                   as: 'ktx2StaticResource'
//                 },
//                 {
//                   model: app.service('static-resource').Model,
//                   as: 'jpegStaticResource'
//                 },
//                 {
//                   model: app.service('static-resource').Model,
//                   as: 'gifStaticResource'
//                 }
//               ]
//             })
//             resolve()
//           } catch (err) {
//             reject(err)
//           }
//         })
//       )
//     if (vol.videoId)
//       promises.push(
//         new Promise(async (resolve, reject) => {
//           try {
//             vol.dataValues.video = await app.service('video').Model.findOne({
//               where: {
//                 id: vol.videoId,
//                 project
//               },
//               include: [
//                 {
//                   model: app.service('static-resource').Model,
//                   as: 'm3u8StaticResource'
//                 },
//                 {
//                   model: app.service('static-resource').Model,
//                   as: 'mp4StaticResource'
//                 }
//               ]
//             })
//             resolve()
//           } catch (err) {
//             reject(err)
//           }
//         })
//       )
//     await Promise.all(promises)
//     console.log('returning vol', vol)
//     return vol
//   } catch (err) {
//     logger.error('volumetric upload error')
//     logger.error(err)
//     throw err
//   }
// }
