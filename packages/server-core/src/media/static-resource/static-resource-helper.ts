/*
CPAL-1.0 License

The contents of this file are subject to the Common Public Attribution License
Version 1.0. (the "License"); you may not use this file except in compliance
with the License. You may obtain a copy of the License at
https://github.com/EtherealEngine/etherealengine/blob/dev/LICENSE.
The License is based on the Mozilla Public License Version 1.1, but Sections 14
and 15 have been added to cover use of software over a computer network and 
provide for limited attribution for the Original Developer. In addition, 
Exhibit A has been modified to be consistent with Exhibit B.

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License for the
specific language governing rights and limitations under the License.

The Original Code is Ethereal Engine.

The Original Developer is the Initial Developer. The Initial Developer of the
Original Code is the Ethereal Engine team.

All portions of the code written by the Ethereal Engine team are Copyright © 2021-2023 
Ethereal Engine. All Rights Reserved.
*/

import * as ffprobe from '@ffprobe-installer/ffprobe'
import appRootPath from 'app-root-path'
import execa from 'execa'
import fs from 'fs'
import mp3Duration from 'mp3-duration'
import path from 'path'
import probe from 'probe-image-size'
import { Readable } from 'stream'

import { StaticResourceInterface } from '@etherealengine/common/src/interfaces/StaticResourceInterface'
import { UploadFile } from '@etherealengine/common/src/interfaces/UploadAssetInterface'
import multiLogger from '@etherealengine/common/src/logger'
import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'
import { KTX2Loader } from '@etherealengine/engine/src/assets/loaders/gltf/KTX2Loader'

import { Application } from '../../../declarations'
import config from '../../appconfig'
import { getStorageProvider } from '../storageprovider/storageprovider'
import { addAssetsAsStaticResource, getFileMetadata } from '../upload-asset/upload-asset.service'

const logger = multiLogger.child('static-resource-helper')

export type MediaUploadArguments = {
  media: Buffer
  thumbnail?: Buffer
  hash: string
  mediaId: string
  fileName: string
  mediaFileType: string
  parentType?: string
  parentId?: string
  LODNumber?: string
  stats?: any
}

/**
 * Get the files to upload for a given resource
 * @param data
 * @param download - if true, will download the file and return it as a buffer, otherwise will return the url
 * @returns
 */
export const downloadResourceAndMetadata = async (
  url: string,
  download = config.server.cloneProjectStaticResources
): Promise<UploadFile> => {
  console.log('getResourceFiles', url, download)
  if (/http(s)?:\/\//.test(url)) {
    // if configured to clone project static resources, we need to fetch the file and upload it
    if (download) {
      const file = await fetch(url)
      return {
        buffer: Buffer.from(await file.arrayBuffer()),
        originalname: url.split('/').pop()!,
        mimetype:
          file.headers.get('content-type') ||
          file.headers.get('Content-Type') ||
          CommonKnownContentTypes[url.split('.').pop()!],
        size: parseInt(file.headers.get('content-length') || file.headers.get('Content-Length') || '0')
      }
    } else {
      // otherwise we just return the url and let the client download it as needed
      const file = await fetch(url, { method: 'HEAD' })
      return {
        buffer: url,
        originalname: url.split('/').pop()!,
        mimetype:
          file.headers.get('content-type') ||
          file.headers.get('Content-Type') ||
          CommonKnownContentTypes[url.split('.').pop()!],
        size: parseInt(file.headers.get('content-length') || file.headers.get('Content-Length') || '0')
      }
    }
  } else {
    const file = fs.readFileSync(url)
    return {
      buffer: download ? file : url,
      originalname: url.split('/').pop()!,
      mimetype: CommonKnownContentTypes[url.split('.').pop()!],
      size: file.length
    }
  }
}

const symbolRe = /__\$project\$__/
const pathSymbol = '__$project$__'

/**
 * install project
 * if external url and clone static resources, clone to /static-resources/project
 * if external url and not clone static resources, link new static resource
 * if internal url, link new static resource
 */
export const addAssetsFromProject = async (
  app: Application,
  urls: string[],
  project: string,
  download = config.server.cloneProjectStaticResources
) => {
  console.log('addAssetsFromProject', urls, project, download)
  const absoluteUrls = urls.map((url) =>
    url.replace(pathSymbol, path.join(appRootPath.path, '/packages/projects/projects'))
  )

  const storageProvider = getStorageProvider()
  const mainURL = absoluteUrls[0]
  const fromStorageProvider = mainURL.split(path.join(storageProvider.cacheDomain, 'projects/'))
  const isExternalToProject = fromStorageProvider.length === 1 || project !== fromStorageProvider[1]?.split('/')?.[0]
  console.log(
    { fromStorageProvider, isExternalToProject },
    mainURL,
    path.join(storageProvider.cacheDomain, 'projects/'),
    storageProvider.cacheDomain,
    mainURL
  )

  console.log(fromStorageProvider.length, project, fromStorageProvider[1]?.split('/')?.[0])

  const { hash, mimeType } = await getFileMetadata({ file: mainURL })
  const key = isExternalToProject ? `static-resources/${project}/` : `projects/${project}/assets/`

  const existingResource = (await app.service('static-resource').Model.findOne({
    where: {
      hash,
      project,
      mimeType
      // key
    }
  })) as StaticResourceInterface

  console.log('existingResource', existingResource, hash, mimeType)

  if (existingResource) return [existingResource]

  const files = await Promise.all(
    absoluteUrls.map((url) => downloadResourceAndMetadata(url, isExternalToProject ? download : false))
  )

  return addAssetsAsStaticResource(app, files, {
    hash: hash,
    path: key,
    project
  })
}

export const getStats = async (buffer: Buffer | string, mimeType: string): Promise<Record<string, any> | undefined> => {
  switch (mimeType) {
    case 'audio/mpeg':
    case 'audio/mp3':
    case 'audio/ogg':
    case 'audio/wav':
      return StatFunctions.audio(buffer, mimeType)
    case 'video/mp4':
    case 'video/webm':
      return StatFunctions.video(buffer, mimeType)
    case 'image/jpeg':
    case 'image/jpg':
    case 'image/png':
    case 'image/gif':
    case 'image/ktx2':
      return StatFunctions.image(buffer, mimeType)
    case 'model/gltf-binary':
    case 'model/gltf+json':
    case 'model/gltf':
    case 'model/glb':
      return StatFunctions.model(buffer, mimeType)
    case 'model/vox':
      return StatFunctions.volumetric(buffer, mimeType)
    default:
      return
  }
}

export const getMP3Duration = async (body): Promise<number> => {
  return new Promise((resolve, reject) =>
    mp3Duration(body, (err, duration) => {
      if (err) reject(err)
      resolve(duration * 1000)
    })
  )
}

export const getAudioStats = async (input: Buffer | string, mimeType: string) => {
  let out = ''
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

export const getVideoStats = async (input: Buffer | string, mimeType: string) => {
  let out = ''
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

export const getImageStats = async (file: Buffer | string, mimeType: string) => {
  if (mimeType === 'image/ktx2') {
    const loader = new KTX2Loader()
    return new Promise<{ width: number; height: number }>((resolve, reject) => {
      if (typeof file === 'string') {
        loader.load(
          file,
          (texture) => {
            const { width, height } = texture.source.data
            resolve({
              width,
              height
            })
          },
          () => {},
          (err) => {
            logger.error('error parsing ktx2')
            logger.error(err)
            reject(err)
          }
        )
      } else {
        loader.parse(
          file,
          (texture) => {
            const { width, height } = texture.source.data
            resolve({
              width,
              height
            })
          },
          (err) => {
            logger.error('error parsing ktx2')
            logger.error(err)
            reject(err)
          }
        )
      }
    })
  } else {
    if (typeof file === 'string') {
      file = (await (await fetch(file)).arrayBuffer()) as Buffer
    }
    const stream = new Readable()
    stream.push(file)
    stream.push(null)
    const imageDimensions = await probe(stream)
    return {
      width: imageDimensions.width as number,
      height: imageDimensions.height as number
    }
  }
}

export const getModelStats = async (file: Buffer | string, mimeType: string) => {
  return {}
}

export const getVolumetricStats = async (file: Buffer | string, mimeType: string) => {
  return {}
}

export const StatFunctions = {
  audio: getAudioStats,
  video: getVideoStats,
  image: getImageStats,
  model: getModelStats,
  volumetric: getVolumetricStats
}
