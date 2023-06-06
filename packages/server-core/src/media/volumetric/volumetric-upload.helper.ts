import { createHash } from 'crypto'
import fs from 'fs'
import fetch from 'node-fetch'
import { Op } from 'sequelize'

import { UploadFile } from '@etherealengine/common/src/interfaces/UploadAssetInterface'
import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { addGenericAssetToS3AndStaticResources } from '../upload-asset/upload-asset.service'
import { videoUpload } from '../video/video-upload.helper'

const uvolMimetype = 'application/octet-stream'

const handleManifest = async (app: Application, url: string, name = 'untitled', volumetricId: string) => {
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
        ]
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
    existingResource = await addGenericAssetToS3AndStaticResources(app, files, uvolMimetype, {
      hash: hash,
      key: `${key}.manifest`,
      staticResourceType: 'data'
    })
  }
  return app.service('data').create({
    staticResourceId: existingResource.id
  })
}

export const volumetricUpload = async (app: Application, data) => {
  try {
    const root = data.url
      .replace(/.drcs$/, '')
      .replace(/.mp4$/, '')
      .replace(/.manifest$/, '')
    const name = root.split('/').pop()
    const videoUrl = `${root}.mp4`
    const drcsUrl = `${root}.drcs`
    const manifestUrl = `${root}.manifest`
    // console.log('urls', videoUrl, drcsUrl, manifestUrl)
    let volumetricEntry, video, manifest

    let drcsFileHead, contentLength
    if (/http(s)?:\/\//.test(drcsUrl)) {
      drcsFileHead = await fetch(drcsUrl, { method: 'HEAD' })
      if (!/^[23]/.test(drcsFileHead.status.toString())) throw new Error('Invalid URL')
      contentLength = drcsFileHead.headers['content-length'] || drcsFileHead.headers?.get('content-length')
    } else {
      drcsFileHead = await fs.statSync(drcsUrl)
      contentLength = drcsFileHead.size.toString()
    }
    if (!data.name) data.name = data.url.split('/').pop().split('.')[0]
    const hash = createHash('sha3-256').update(contentLength).update(data.name).digest('hex')
    const extension = drcsUrl.split('.').pop()

    let drcs = await app.service('static-resource').Model.findOne({
      where: {
        hash
      }
    })
    if (!drcs) {
      let file, body
      if (/http(s)?:\/\//.test(drcsUrl)) {
        file = await fetch(drcsUrl)
        body = Buffer.from(await file.arrayBuffer())
      } else body = fs.readFileSync(drcsUrl)
      volumetricEntry = await app.service('volumetric').create({})
      const key = `static-resources/volumetric/${volumetricEntry.id}/${name}`
      drcs = await addGenericAssetToS3AndStaticResources(app, body, 'application/octet-stream', {
        hash: hash,
        key: `${key}.${extension}`,
        staticResourceType: 'volumetric',
        stats: {
          size: contentLength
        }
      })
    } else {
      volumetricEntry = await app.service('volumetric').Model.findOne({
        where: {
          [Op.or]: [
            {
              drcsStaticResourceId: {
                [Op.eq]: drcs.id
              }
            }
          ]
        }
      })
      if (!volumetricEntry)
        volumetricEntry = await app.service('volumetric').create({
          drcsStaticResourceId: drcs.id
        })
    }

    ;[video, manifest] = await Promise.all([
      videoUpload(app, { url: videoUrl, name }, volumetricEntry.id, 'volumetric'),
      handleManifest(app, manifestUrl, name, volumetricEntry.id)
    ])

    await app.service('volumetric').patch(volumetricEntry.id, {
      drcsStaticResourceId: drcs.id,
      videoId: video.id,
      manifestId: manifest.id
    })

    const vol = await app.service('volumetric').Model.findOne({
      where: {
        id: volumetricEntry.id
      }
    })
    // Initially, the population of child tables was just done with includes, but this led to more than the max 61
    // table joins some versions of SQL, like MariaDB, can do at once. The child fetches are now done individually
    // to avoid this limit
    const promises = [] as Promise<void>[]
    if (vol.drcsStaticResourceId)
      promises.push(
        new Promise(async (resolve, reject) => {
          try {
            vol.dataValues.drcsStaticResource = await app.service('static-resource').Model.findOne({
              where: {
                id: vol.drcsStaticResourceId
              }
            })
            resolve()
          } catch (err) {
            reject(err)
          }
        })
      )
    if (vol.uvolStaticResourceId)
      promises.push(
        new Promise(async (resolve, reject) => {
          try {
            vol.dataValues.uvolStaticResource = await app.service('static-resource').Model.findOne({
              where: {
                id: vol.uvolStaticResourceId
              }
            })
            resolve()
          } catch (err) {
            reject(err)
          }
        })
      )
    if (vol.manifestId)
      promises.push(
        new Promise(async (resolve, reject) => {
          try {
            vol.dataValues.manifest = await app.service('data').Model.findOne({
              where: {
                id: vol.manifestId
              },
              include: [
                {
                  model: app.service('static-resource').Model,
                  as: 'staticResource'
                }
              ]
            })
            resolve()
          } catch (err) {
            reject(err)
          }
        })
      )
    if (vol.thumbnailId)
      promises.push(
        new Promise(async (resolve, reject) => {
          try {
            vol.dataValues.thumbnail = await app.service('image').Model.findOne({
              where: {
                id: vol.thumbnailId
              },
              include: [
                {
                  model: app.service('static-resource').Model,
                  as: 'pngStaticResource'
                },
                {
                  model: app.service('static-resource').Model,
                  as: 'ktx2StaticResource'
                },
                {
                  model: app.service('static-resource').Model,
                  as: 'jpegStaticResource'
                },
                {
                  model: app.service('static-resource').Model,
                  as: 'gifStaticResource'
                }
              ]
            })
            resolve()
          } catch (err) {
            reject(err)
          }
        })
      )
    if (vol.videoId)
      promises.push(
        new Promise(async (resolve, reject) => {
          try {
            vol.dataValues.video = await app.service('video').Model.findOne({
              where: {
                id: vol.videoId
              },
              include: [
                {
                  model: app.service('static-resource').Model,
                  as: 'm3u8StaticResource'
                },
                {
                  model: app.service('static-resource').Model,
                  as: 'mp4StaticResource'
                }
              ]
            })
            resolve()
          } catch (err) {
            reject(err)
          }
        })
      )
    await Promise.all(promises)
    console.log('returning vol', vol)
    return vol
  } catch (err) {
    logger.error('volumetric upload error')
    logger.error(err)
    throw err
  }
}

//https://resources-dev.etherealengine.com/volumetric/biglatto_bigenergy.drcs
