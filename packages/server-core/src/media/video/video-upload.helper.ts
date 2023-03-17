import * as ffprobe from '@ffprobe-installer/ffprobe'
import { createHash } from 'crypto'
import execa from 'execa'
import fs from 'fs'
import fetch from 'node-fetch'
import { Op } from 'sequelize'
import { Readable } from 'stream'

import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { uploadMediaStaticResource } from '../static-resource/static-resource-helper'

export const videoUpload = async (app: Application, data, parentId?: string, parentType?: string) => {
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
      if (parentType === 'volumetric') {
        if (!/^[23]/.test(fileHead.status.toString())) {
          let parts = data.url.split('.')
          if (parts.length === 2) parts.splice(1, 0, 'LOD0')
          // else if (parts.length === 3 && /LOD[0-9]?[0-9]/.test(parts[1]))
          //     parts[1] = 'LOD0'
          data.url = parts.join('.')
          fileHead = await fetch(data.url, { method: 'HEAD' })
          contentLength = fileHead.size.toString()
        }
      }
      if (!data.name) data.name = data.url.split('/').pop().split('.')[0]
      extension = data.url.split('.').pop()
    } else if (data.file) {
      switch (data.file.mimetype) {
        case 'video/mp4':
          extension = 'mp4'
          break
        case 'video/m3u8':
          extension = 'm3u8'
          break
      }
      contentLength = data.file.size.toString()
    }
    if (/.LOD0/.test(data.name)) data.name = data.name.replace('.LOD0', '')
    const hash = createHash('sha3-256').update(contentLength).update(data.name).digest('hex')
    let existingVideo, thumbnail
    let existingResource = await app.service('static-resource').Model.findOne({
      where: {
        hash
      }
    })

    const include = [
      {
        model: app.service('static-resource').Model,
        as: 'm3u8StaticResource'
      },
      {
        model: app.service('static-resource').Model,
        as: 'mp4StaticResource'
      }
    ]

    if (existingResource) {
      existingVideo = await app.service('video').Model.findOne({
        where: {
          [Op.or]: [
            {
              mp4StaticResourceId: {
                [Op.eq]: existingResource.id
              }
            },
            {
              m3u8StaticResourceId: {
                [Op.eq]: existingResource.id
              }
            }
          ]
        },
        include
      })
    }
    if (existingResource && existingVideo) return existingVideo
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
      const stats = (await getVideoStats(body)) as any
      stats.size = contentLength
      const newVideo = await app.service('video').create({
        duration: stats.duration
      })
      if (!existingResource) {
        const uploadData = {
          media: body,
          hash,
          fileName: data.name,
          mediaId: newVideo.id,
          mediaFileType: extension,
          stats
        } as any
        if (parentId) uploadData.parentId = parentId
        if (parentType) uploadData.parentType = parentType
        ;[existingResource, thumbnail] = await uploadMediaStaticResource(app, uploadData, 'video')
      }
      const update = {} as any
      if (existingResource?.id) {
        const staticResourceColumn = `${extension}StaticResourceId`
        update[staticResourceColumn] = existingResource.id
      }
      if (thumbnail?.id) update.thumbnail = thumbnail.id
      try {
        await app.service('video').patch(newVideo.id, update)
      } catch (err) {
        logger.error('error updating video with resources')
        logger.error(err)
        throw err
      }
      return app.service('video').Model.findOne({
        where: {
          id: newVideo.id
        },
        include
      })
    }
  } catch (err) {
    logger.error('video upload error')
    logger.error(err)
    throw err
  }
}

export const getVideoStats = async (body) => {
  const stream = new Readable()
  stream.push(body)
  stream.push(null)
  const out = (
    await execa(ffprobe.path, ['-v', 'error', '-show_format', '-show_streams', '-i', 'pipe:0'], {
      reject: false,
      input: stream
    })
  ).stdout
  const width = /width=(\d+)/.exec(out)
  const height = /height=(\d+)/.exec(out)
  const duration = /duration=(\d+)/.exec(out)
  const channels = /channels=(\d+)/.exec(out)
  const bitrate = /bit_rate=(\d+)/.exec(out)
  return {
    width: width ? parseInt(width[1]) : null,
    height: height ? parseInt(height[1]) : null,
    duration: duration ? parseInt(duration[1]) : 0,
    channels: channels ? parseInt(channels[1]) : null,
    bitrate: bitrate ? parseInt(bitrate[1]) : null
  }
}
