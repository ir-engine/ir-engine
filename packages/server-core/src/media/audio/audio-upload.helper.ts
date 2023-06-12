import * as ffprobe from '@ffprobe-installer/ffprobe'
import { createHash } from 'crypto'
import execa from 'execa'
import fs from 'fs'
import mp3Duration from 'mp3-duration'
import fetch from 'node-fetch'
import { Op } from 'sequelize'
import { Readable } from 'stream'

import { AudioInterface } from '@etherealengine/common/src/dbmodels/Audio'
import { UploadFile } from '@etherealengine/common/src/interfaces/UploadAssetInterface'
import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { getResourceFiles, uploadMediaStaticResource } from '../static-resource/static-resource-helper'
import { addGenericAssetToS3AndStaticResources, UploadAssetArgs } from '../upload-asset/upload-asset.service'

export const getMP3Duration = async (body): Promise<number> => {
  return new Promise((resolve, reject) =>
    mp3Duration(body, (err, duration) => {
      if (err) reject(err)
      resolve(duration * 1000)
    })
  )
}

export const audioUpload = async (app: Application, data: UploadAssetArgs) => {
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
      if (!data.name) data.name = data.url.split('/').pop()!.split('.')[0]
      extension = data.url.split('.').pop()
    } else if (data.files) {
      const mainFile = data.files[0]!
      switch (mainFile.mimetype) {
        case 'application/octet-stream':
          extension = mainFile.originalname.split('.').pop()
          break
        case 'audio/mp3':
        case 'audio/mpeg':
          extension = 'mp3'
          break
        case 'audio/ogg':
          extension = 'ogg'
          break
      }
      contentLength = mainFile.size.toString()
      if (!data.name) data.name = mainFile.originalname
    }

    const hash = createHash('sha3-256').update(contentLength).update(data.name!).digest('hex')
    let existingAudio
    let existingResource = await app.service('static-resource').Model.findOne({
      where: {
        hash
      }
    })

    const include = [
      {
        model: app.service('static-resource').Model,
        as: 'oggStaticResource'
      },
      {
        model: app.service('static-resource').Model,
        as: 'mp3StaticResource'
      },
      {
        model: app.service('static-resource').Model,
        as: 'mpegStaticResource'
      }
    ]

    if (existingResource) {
      existingAudio = await app.service('audio').Model.findOne({
        where: {
          [Op.or]: [
            {
              mp3StaticResourceId: {
                [Op.eq]: existingResource.id
              }
            },
            {
              mpegStaticResourceId: {
                [Op.eq]: existingResource.id
              }
            },
            {
              oggStaticResourceId: {
                [Op.eq]: existingResource.id
              }
            }
          ]
        },
        include
      })
    }

    if (existingResource && existingAudio) return existingAudio

    const files = await getResourceFiles(data)
    const stats = (await getAudioStats(files[0].buffer)) as any
    stats.size = contentLength
    const newAudio = (await app.service('audio').create({
      duration: stats.duration * 1000
    })) as AudioInterface
    const key = `static-resources/audio/${newAudio.id}`
    if (!existingResource)
      existingResource = await addGenericAssetToS3AndStaticResources(app, files, extension, {
        hash: hash,
        key: key,
        staticResourceType: 'audio',
        stats
      })
    const update = {} as any
    if (existingResource?.id) {
      const staticResourceColumn = `${extension}StaticResourceId`
      update[staticResourceColumn] = existingResource.id
    }
    try {
      await app.service('audio').patch(newAudio.id, update)
    } catch (err) {
      logger.error('error updating audio with resources')
      logger.error(err)
      throw err
    }

    return app.service('audio').Model.findOne({
      where: {
        id: newAudio.id
      },
      include
    })
  } catch (err) {
    logger.error('audio upload error')
    logger.error(err)
    throw err
  }
}

export const getAudioStats = async (input: Buffer | string) => {
  let out = ''
  if (typeof input === 'string') {
    out = (await execa(ffprobe.path, ['-v', 'error', '-show_format', '-show_streams', input])).stdout
  } else {
    const stream = new Readable()
    stream.push(input)
    stream.push(null)
    out = (
      await execa(ffprobe.path, ['-v', 'error', '-show_format', '-show_streams', '-i', 'pipe:0'], {
        reject: false,
        input: stream
      })
    ).stdout
  }
  let mp3Duration: number | null = null
  const duration = /duration=(\d+)/.exec(out)
  const channels = /channels=(\d+)/.exec(out)
  const bitrate = /bit_rate=(\d+)/.exec(out)
  const samplerate = /sample_rate=(\d+)/.exec(out)
  const codecname = /codec_name=(\w+)/.exec(out)
  if (codecname && codecname[1] === 'mp3') mp3Duration = await getMP3Duration(input)
  return {
    duration: mp3Duration ? mp3Duration : duration ? parseInt(duration[1]) : null,
    channels: channels ? parseInt(channels[1]) : null,
    bitrate: bitrate ? parseInt(bitrate[1]) : null,
    samplerate: samplerate ? parseInt(samplerate[1]) : null
  }
}
