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

import { ResourcesJson } from '@etherealengine/common/src/interfaces/ResourcesJson'
import { StaticResourceType, staticResourcePath } from '@etherealengine/common/src/schema.type.module'
import * as ffprobe from '@ffprobe-installer/ffprobe'
import appRootPath from 'app-root-path'
import execa from 'execa'
import fs from 'fs'
import mp3Duration from 'mp3-duration'
import path from 'path'
import probe from 'probe-image-size'
import { Readable } from 'stream'
import { Application } from '../../../declarations'
import config from '../../appconfig'
import { getStorageProvider } from '../storageprovider/storageprovider'

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

export const getStats = async (buffer: Buffer | string, mimeType: string): Promise<Record<string, any>> => {
  try {
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
        return {}
    }
  } catch (e) {
    return {}
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
  let mp3Duration = 0
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

export const getImageStats = async (
  file: Buffer | string,
  mimeType: string
): Promise<{ width: number; height: number }> => {
  if (mimeType === 'image/ktx2') {
    if (typeof file === 'string')
      file = Buffer.from(await (await fetch(file, { headers: { range: 'bytes=0-28' } })).arrayBuffer())
    const widthBuffer = file.slice(20, 24)
    const heightBuffer = file.slice(24, 28)
    return {
      height: heightBuffer.readUInt32LE(),
      width: widthBuffer.readUInt32LE()
    }
  } else {
    if (typeof file === 'string') file = Buffer.from(await (await fetch(file)).arrayBuffer())
    const stream = new Readable()
    stream.push(file)
    stream.push(null)
    try {
      const imageDimensions = await probe(stream)
      return {
        width: imageDimensions.width as number,
        height: imageDimensions.height as number
      }
    } catch (e) {
      console.error('error getting image stats')
      console.error(e)
      console.log(file, mimeType)
    }
  }
  return {} as any
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

export const regenerateProjectResourcesJson = async (app: Application, projectName: string) => {
  const resources: StaticResourceType[] = await app.service(staticResourcePath).find({
    query: { project: projectName },
    paginate: false
  })
  if (resources.length === 0) return
  const resourcesJson = Object.fromEntries(
    resources.map((resource) => [
      resource.key.replace(`projects/${projectName}/`, ''),
      {
        type: resource.type,
        tags: resource.tags ?? undefined,
        dependencies: resource.dependencies ?? undefined,
        licensing: resource.licensing ?? undefined,
        description: resource.description ?? undefined,
        attribution: resource.attribution ?? undefined,
        thumbnailKey: resource.thumbnailKey ?? undefined,
        thumbnailMode: resource.thumbnailMode ?? undefined
      }
    ])
  )

  const key = `projects/${projectName}/resources.json`
  const body = Buffer.from(JSON.stringify(resourcesJson, null, 2))

  const storageProvider = getStorageProvider()

  await storageProvider.putObject(
    {
      Key: key,
      Body: body,
      ContentType: 'application/json'
    },
    {
      isDirectory: false
    }
  )

  if (config.fsProjectSyncEnabled) {
    const filePath = path.join(appRootPath.path, 'packages', 'projects', key)
    const dirname = path.dirname(filePath)
    fs.mkdirSync(dirname, { recursive: true })
    fs.writeFileSync(filePath, body)
  }
}

export const patchSingleProjectResourcesJson = async (app: Application, id: string) => {
  // refetch resource since after hooks have not run resolvers yet to parse strings into objects
  const resource = (await app.service(staticResourcePath).get(id)) as StaticResourceType

  const projectName = resource.project

  const key = `projects/${projectName}/resources.json`
  const storageProvider = getStorageProvider()

  if (!(await storageProvider.doesExist('resources.json', `projects/${projectName}`))) {
    const resourcesJson = {
      [resource.key.replace(`projects/${projectName}/`, '')]: {
        type: resource.type,
        tags: resource.tags ?? undefined,
        dependencies: resource.dependencies ?? undefined,
        licensing: resource.licensing ?? undefined,
        description: resource.description ?? undefined,
        attribution: resource.attribution ?? undefined,
        thumbnailKey: resource.thumbnailKey ?? undefined,
        thumbnailMode: resource.thumbnailMode ?? undefined
      }
    }

    const sortedResourcesJson = Object.fromEntries(
      Object.entries(resourcesJson).sort(([a], [b]) => {
        return a.localeCompare(b)
      })
    )

    const body = Buffer.from(JSON.stringify(sortedResourcesJson, null, 2))

    await storageProvider.putObject(
      {
        Key: key,
        Body: body,
        ContentType: 'application/json'
      },
      {
        isDirectory: false
      }
    )

    if (config.fsProjectSyncEnabled) {
      const filePath = path.join(appRootPath.path, 'packages', 'projects', key)
      const dirname = path.dirname(filePath)
      fs.mkdirSync(dirname, { recursive: true })
      fs.writeFileSync(filePath, body)
    }
    return
  }

  const result = await storageProvider.getObject(key)
  const resourcesJson = JSON.parse(result.Body.toString()) as ResourcesJson

  const projectRelativeKey = resource.key.replace(`projects/${projectName}/`, '')
  resourcesJson[projectRelativeKey] = {
    type: resource.type,
    tags: resource.tags ?? undefined,
    dependencies: resource.dependencies ?? undefined,
    licensing: resource.licensing ?? undefined,
    description: resource.description ?? undefined,
    attribution: resource.attribution ?? undefined,
    thumbnailKey: resource.thumbnailKey ?? undefined,
    thumbnailMode: resource.thumbnailMode ?? undefined
  }

  const sortedResourcesJson = Object.fromEntries(
    Object.entries(resourcesJson).sort(([a], [b]) => {
      return a.localeCompare(b)
    })
  )

  const body = Buffer.from(JSON.stringify(sortedResourcesJson, null, 2))

  await storageProvider.putObject(
    {
      Key: key,
      Body: body,
      ContentType: 'application/json'
    },
    {
      isDirectory: false
    }
  )

  if (config.fsProjectSyncEnabled) {
    const filePath = path.join(appRootPath.path, 'packages', 'projects', key)
    const dirname = path.dirname(filePath)
    fs.mkdirSync(dirname, { recursive: true })
    fs.writeFileSync(filePath, body)
  }
}

export const removeProjectResourcesJson = async (app: Application, resource: StaticResourceType) => {
  const projectName = resource.project

  const key = `projects/${projectName}/resources.json`
  const storageProvider = getStorageProvider()

  const resourcesJson = JSON.parse((await storageProvider.getObject(key)).Body.toString()) as ResourcesJson

  const projectRelativeKey = resource.key.replace(`projects/${projectName}/`, '')
  delete resourcesJson[projectRelativeKey]

  if (Object.keys(resourcesJson).length === 0) {
    await storageProvider.deleteResources([key])
    if (config.fsProjectSyncEnabled) {
      const filePath = path.join(appRootPath.path, 'packages', 'projects', key)
      fs.unlinkSync(filePath)
    }
    return
  }

  const body = Buffer.from(JSON.stringify(resourcesJson, null, 2))

  await storageProvider.putObject(
    {
      Key: key,
      Body: body,
      ContentType: 'application/json'
    },
    {
      isDirectory: false
    }
  )

  if (config.fsProjectSyncEnabled) {
    const filePath = path.join(appRootPath.path, 'packages', 'projects', key)
    const dirname = path.dirname(filePath)
    fs.mkdirSync(dirname, { recursive: true })
    fs.writeFileSync(filePath, body)
  }
}
