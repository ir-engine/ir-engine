import { createHash } from 'crypto'
import fs from 'fs'
import fetch from 'node-fetch'
import probe from 'probe-image-size'
import { Op } from 'sequelize'
import { Readable } from 'stream'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { uploadMediaStaticResource } from '../static-resource/static-resource-helper'

export const imageUpload = async (app: Application, data) => {
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
        case 'image/png':
          extension = 'png'
          break
        case 'image/gif':
          extension = 'gif'
          break
        case 'image/ktx2':
          extension = 'ktx2'
          break
        case 'jpeg':
        case 'jpg':
          extension = 'jpg'
          break
      }
      contentLength = data.file.size.toString()
    }
    if (/.LOD0/.test(data.name)) data.name = data.name.replace('.LOD0', '')
    const hash = createHash('sha3-256').update(contentLength).update(data.name).digest('hex')
    let existingImage, thumbnail
    let existingResource = await app.service('static-resource').Model.findOne({
      where: {
        hash
      }
    })

    if (existingResource)
      existingImage = await app.service('image').Model.findOne({
        where: {
          [Op.or]: [
            {
              pngStaticResourceId: {
                [Op.eq]: existingResource.id
              }
            },
            {
              jpegStaticResourceId: {
                [Op.eq]: existingResource.id
              }
            },
            {
              gifStaticResourceId: {
                [Op.eq]: existingResource.id
              }
            },
            {
              ktx2StaticResourceId: {
                [Op.eq]: existingResource.id
              }
            }
          ]
        }
      })
    if (existingResource && existingImage) return app.service('image').get(existingImage.id)
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
      const stream = new Readable()
      stream.push(body)
      stream.push(null)
      const imageDimensions = await probe(stream)
      const newImage = await app.service('image').create({
        width: imageDimensions.width,
        height: imageDimensions.height
      })
      if (!existingResource)
        [existingResource, thumbnail] = await uploadMediaStaticResource(
          app,
          {
            media: body,
            hash,
            fileName: data.name,
            mediaId: newImage.id,
            mediaFileType: extension,
            stats: {
              ...imageDimensions,
              size: contentLength
            }
          },
          'image'
        )
      const update = {} as any
      if (newImage?.id) {
        if (extension === 'jpg') extension = 'jpeg'
        const staticResourceColumn = `${extension}StaticResourceId`
        update[staticResourceColumn] = existingResource.id
      }
      if (thumbnail?.id) update.thumbnail = thumbnail.id
      try {
        await app.service('image').patch(newImage.id, update)
      } catch (err) {
        logger.error('error updating image with resources')
        logger.error(err)
        throw err
      }
      return app.service('image').get(newImage.id)
    }
  } catch (err) {
    logger.error('image upload error')
    logger.error(err)
    throw err
  }
}
