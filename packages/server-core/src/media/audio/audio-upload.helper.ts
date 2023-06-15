import * as ffprobe from '@ffprobe-installer/ffprobe'
import { createHash } from 'crypto'
import execa from 'execa'
import fs from 'fs'
import mp3Duration from 'mp3-duration'
import fetch from 'node-fetch'
import path from 'path'
import { Op } from 'sequelize'
import { Readable } from 'stream'

import { AudioInterface } from '@etherealengine/common/src/interfaces/AudioInterface'
import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { downloadResourceAndMetadata, getExistingResource } from '../static-resource/static-resource-helper'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { addAssetAsStaticResource, getFileMetadata, UploadAssetArgs } from '../upload-asset/upload-asset.service'

export const getMP3Duration = async (body): Promise<number> => {
  return new Promise((resolve, reject) =>
    mp3Duration(body, (err, duration) => {
      if (err) reject(err)
      resolve(duration * 1000)
    })
  )
}

/**
 * install project
 * if external url and clone static resources, clone to /static-resources/project
 * if external url and not clone static resources, link new static resource
 * if internal url, link new static resource
 */
export const addAudioAssetFromProject = async (
  app: Application,
  urls: string[],
  project: string,
  download = config.server.cloneProjectStaticResources
) => {
  console.log('addAudioAssetFromProject', urls, project, download)
  const storageProvider = getStorageProvider()
  const mainURL = urls[0]
  const fromStorageProvider = mainURL.split(path.join(storageProvider.cacheDomain, 'projects/'))
  const isExternalToProject =
    !project || fromStorageProvider.length === 1 || project !== fromStorageProvider?.[1]?.split('/')?.[0]
  console.log({ isExternalToProject })

  const { assetName, hash } = await getFileMetadata({ file: mainURL })
  const existingAudio = await getExistingResource<AudioInterface>(app, 'audio', hash, project)
  if (existingAudio) return existingAudio

  const files = await Promise.all(
    urls.map((url) => downloadResourceAndMetadata(url, isExternalToProject ? download : false))
  )
  const stats = await getAudioStats(files[0].buffer)

  const key = isExternalToProject ? `static-resources/${project}/` : `projects/${project}/assets/`

  const resource = await addAssetAsStaticResource(app, files, {
    hash: hash,
    path: key,
    staticResourceType: 'audio',
    stats,
    project
  })

  return (await app.service('audio').create({
    name: assetName,
    duration: stats.duration,
    staticResourceId: resource.id
  })) as AudioInterface
}

/**
 * hash exists?
 * no - upload to /temp & return new static resource
 * yes - return static resource
 */
export const audioUploadFile = async (app: Application, data: UploadAssetArgs) => {
  console.log('audioUpload', data)
  const { assetName, hash } = await getFileMetadata({
    file: data.files[0],
    name: data.files[0].originalname
  })

  const existingAudio = await getExistingResource<AudioInterface>(app, 'audio', hash)
  if (existingAudio) return existingAudio

  const stats = await getAudioStats(data.files[0].buffer)

  const key = `/temp/${hash}`
  const resource = await addAssetAsStaticResource(app, data.files, {
    hash: hash,
    path: key,
    staticResourceType: 'audio',
    stats,
    project: data.project
  })

  return (await app.service('audio').create({
    duration: stats.duration * 1000,
    name: assetName,
    staticResourceId: resource.id
  })) as AudioInterface
}

export const getAudioStats = async (input: Buffer | string) => {
  let out = ''
  try {
    if (typeof input === 'string') {
      const isHttp = input.startsWith('http')
      // todo - when not downloaded but still need stats, ignore of now
      if (!isHttp) out = (await execa(ffprobe.path, ['-v', 'error', '-show_format', '-show_streams', input])).stdout
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
  } catch (e) {
    // no-op
  }
  let mp3Duration: number = 0
  const duration = /duration=(\d+)/.exec(out)
  const channels = /channels=(\d+)/.exec(out)
  const bitrate = /bit_rate=(\d+)/.exec(out)
  const samplerate = /sample_rate=(\d+)/.exec(out)
  const codecname = /codec_name=(\w+)/.exec(out)
  if (codecname && codecname[1] === 'mp3') mp3Duration = await getMP3Duration(input)
  return {
    duration: mp3Duration ? mp3Duration : duration ? parseInt(duration[1]) : 0,
    channels: channels ? parseInt(channels[1]) : 0,
    bitrate: bitrate ? parseInt(bitrate[1]) : 0,
    samplerate: samplerate ? parseInt(samplerate[1]) : 0
  }
}
