import * as ffprobe from '@ffprobe-installer/ffprobe'
import appRootPath from 'app-root-path'
import { createHash } from 'crypto'
import execa from 'execa'
import fs from 'fs'
import fetch from 'node-fetch'
import path from 'path'
import { Op } from 'sequelize'
import { Readable } from 'stream'

import { VideoInterface } from '@etherealengine/common/src/interfaces/VideoInterface'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import logger from '../../ServerLogger'
import { downloadResourceAndMetadata, getExistingResource } from '../static-resource/static-resource-helper'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { addAssetAsStaticResource, getFileMetadata, UploadAssetArgs } from '../upload-asset/upload-asset.service'

const relativePath = path.join(appRootPath.path, '/packages/')

export const addVideoAssetFromProject = async (
  app: Application,
  urls: string[],
  project: string,
  download = config.server.cloneProjectStaticResources
) => {
  const storageProvider = getStorageProvider()
  const mainURL = urls[0]
  const isExternalToProject =
    !project || project !== mainURL.split(path.join(storageProvider.cacheDomain, 'projects/'))?.[1]?.split('/')?.[0]

  const { assetName, hash } = await getFileMetadata({ file: mainURL })
  const existingVideo = await getExistingResource<VideoInterface>(app, 'video', hash)
  if (existingVideo) return existingVideo

  const files = await Promise.all(
    urls.map((url) => downloadResourceAndMetadata(url, isExternalToProject ? false : download))
  )
  const stats = await getVideoStats(files[0].buffer)

  const key = isExternalToProject ? `static-resources/${project}/` : `projects/${project}/assets/`

  const resource = await addAssetAsStaticResource(app, files, {
    hash: hash,
    path: key,
    staticResourceType: 'video',
    stats,
    project
  })

  return app.service('video').create({
    name: assetName,
    duration: stats.duration,
    staticResourceId: resource.id
  })
}

export const videoUploadFile = async (app: Application, data: UploadAssetArgs) => {
  console.log('videoUpload', data)
  const { assetName, hash } = await getFileMetadata({
    file: data.files[0],
    name: data.files[0].originalname
  })

  const existingVideo = await getExistingResource<VideoInterface>(app, 'video', hash)
  if (existingVideo) return existingVideo

  const stats = await getVideoStats(data.files[0].buffer)

  const key = `/temp/${hash}`
  const resource = await addAssetAsStaticResource(app, data.files, {
    hash: hash,
    path: key,
    staticResourceType: 'video',
    stats,
    project: data.project
  })

  return (await app.service('video').create({
    duration: stats.duration * 1000,
    name: assetName,
    staticResourceId: resource.id
  })) as VideoInterface
}

export const getVideoStats = async (input: Buffer | string) => {
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
