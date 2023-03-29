import { createHash } from 'crypto'
import fs from 'fs'
import fetch from 'node-fetch'
import { Op } from 'sequelize'
import { Readable } from 'stream'

import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { addGenericAssetToS3AndStaticResources } from '../upload-asset/upload-asset.service'

export const modelUpload = async (app: Application, data) => {
  try {
    let fileHead, contentLength, extension
    if (data.url) {
      if (/http(s)?:\/\//.test(data.url)) {
        fileHead = await fetch(data.url, { method: 'HEAD' })
        if (!/^[23]/.test(fileHead.status.toString())) throw new Error('Invalid URL')
        contentLength = fileHead.headers['content-length'] || fileHead.headers?.get('content-length')
      } else {
        fileHead = await fs.statSync(data.url)
        contentLength = fileHead.size.toString()
      }
      if (!data.name) data.name = data.url.split('/').pop().split('.')[0]
      extension = data.url.split('.').pop()
    } else if (data.file) {
      switch (data.file.mimetype) {
        case 'model/gltf':
          extension = 'png'
          break
        case 'model/glb':
          extension = 'glb'
          break
        case 'model/usdz':
          extension = 'usdz'
          break
        case 'model/fbx':
          extension = 'fbx'
          break
      }
      contentLength = data.file.size.toString()
    }
    if (/.LOD0/.test(data.name)) data.name = data.name.replace('.LOD0', '')
    const hash = createHash('sha3-256').update(contentLength).update(data.name).digest('hex')
    let existingModel
    let existingResource = await app.service('static-resource').Model.findOne({
      where: {
        hash
      }
    })

    if (existingResource)
      existingModel = await app.service('model').Model.findOne({
        where: {
          [Op.or]: [
            {
              glbStaticResourceId: {
                [Op.eq]: existingResource.id
              }
            },
            {
              gltfStaticResourceId: {
                [Op.eq]: existingResource.id
              }
            },
            {
              fbxStaticResourceId: {
                [Op.eq]: existingResource.id
              }
            },
            {
              usdzStaticResourceId: {
                [Op.eq]: existingResource.id
              }
            }
          ]
        }
      })
    if (existingResource && existingModel) return app.service('model').get(existingModel.id)
    else {
      let file, body
      if (data.url) {
        if (/http(s)?:\/\//.test(data.url)) {
          file = await fetch(data.url)
          body = Buffer.from(await file.arrayBuffer())
        } else body = fs.readFileSync(data.url)
      } else if (data.file) {
        body = data.file.buffer
      }
      const newModel = await app.service('model').create({})
      if (!existingResource) {
        const key = `static-resources/model/${newModel.id}`
        existingResource = await addGenericAssetToS3AndStaticResources(app, body, CommonKnownContentTypes[extension], {
          hash: hash,
          key: `${key}/${data.name}.${extension}`,
          staticResourceType: 'model3d',
          stats: {
            size: contentLength
          }
        })
      }
      const update = {} as any
      if (newModel?.id) {
        const staticResourceColumn = `${extension}StaticResourceId`
        update[staticResourceColumn] = existingResource.id
      }
      try {
        await app.service('model').patch(newModel.id, update)
      } catch (err) {
        logger.error('error updating model with resources')
        logger.error(err)
        throw err
      }
      return app.service('model').get(newModel.id)
    }
  } catch (err) {
    logger.error('model upload error')
    logger.error(err)
    throw err
  }
}
