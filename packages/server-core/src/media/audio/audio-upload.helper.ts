import * as ffprobe from '@ffprobe-installer/ffprobe'
import { createHash } from 'crypto'
import execa from 'execa'
import fs from 'fs'
import mp3Duration from 'mp3-duration'
import fetch from 'node-fetch'
import { Op } from 'sequelize'
import { Readable } from 'stream'

import { AudioInterface } from '@etherealengine/common/src/interfaces/AudioInterface'
import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { getResourceFiles } from '../static-resource/static-resource-helper'
import { addAssetAsStaticResource, UploadAssetArgs } from '../upload-asset/upload-asset.service'

export const getMP3Duration = async (body): Promise<number> => {
  return new Promise((resolve, reject) =>
    mp3Duration(body, (err, duration) => {
      if (err) reject(err)
      resolve(duration * 1000)
    })
  )
}

export const audioUpload = async (
  app: Application,
  data: UploadAssetArgs,
  forceDownload = config.server.cloneProjectStaticResources
) => {
  console.trace('audioUpload', data)
  try {
    const project = data.project
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
      if (!data.name) data.name = data.url.split('/').pop()
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
    let existingAudio: AudioInterface | null = null
    let existingResource = (await app.service('static-resource').Model.findOne({
      where: {
        hash
      }
    })) as StaticResourceInterface | null

    if (existingResource) {
      existingAudio = await app.service('audio').Model.findOne({
        include: {
          model: app.service('static-resource').Model,
          as: 'staticResource',
          where: {
            id: existingResource.id
          }
        }
      })
    }

    if (existingResource && existingAudio) return existingAudio

    const files = await getResourceFiles(data, forceDownload)
    // const mimeType = files[0].mimetype
    const stats = (await getAudioStats(files[0].buffer)) as any
    stats.size = contentLength

    const newAudio = (await app.service('audio').create({
      duration: stats.duration * 1000,
      name: data.name
    })) as AudioInterface

    const key = `static-resources/${project}/`
    if (!existingResource)
      existingResource = await addAssetAsStaticResource(app, files, {
        hash: hash,
        path: key,
        staticResourceType: 'audio',
        stats,
        project
      })

    try {
      if (existingResource?.id) {
        const update = {
          staticResourceId: existingResource.id
        }
        await app.service('audio').patch(newAudio.id, update)
      }
    } catch (err) {
      logger.error('error updating audio with resources')
      logger.error(err)
      throw err
    }

    return app.service('audio').Model.findOne({
      where: {
        id: newAudio.id
      },
      include: {
        model: app.service('static-resource').Model,
        as: 'staticResource'
      }
    }) as AudioInterface
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
