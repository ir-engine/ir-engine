import { Params } from '@feathersjs/feathers'
import fs from 'fs'
import path from 'path'

import { AvatarProps } from '@xrengine/common/src/interfaces/AvatarInterface'
import { CommonKnownContentTypes } from '@xrengine/common/src/utils/CommonKnownContentTypes'

import { Application } from '../../../declarations'
import logger from '../../logger'
import { addGenericAssetToS3AndStaticResources } from '../../media/upload-asset/upload-asset.service'

export type AvatarUploadArguments = {
  avatar: Buffer
  thumbnail: Buffer
  avatarName: string
  avatarFileType?: string
  isPublicAvatar?: boolean
  userId?: string
}

// todo: move this somewhere else
const supportedAvatars = ['glb', 'gltf', 'vrm', 'fbx']

export const installAvatarsFromProject = async (app: Application, avatarsFolder: string) => {
  const avatarsToInstall = fs
    .readdirSync(avatarsFolder, { withFileTypes: true })
    .filter((dirent) => supportedAvatars.includes(dirent.name.split('.').pop()!))
    .map((dirent) => {
      const avatarName = dirent.name.substring(0, dirent.name.lastIndexOf('.')) // remove extension
      const avatarFileType = dirent.name.substring(dirent.name.lastIndexOf('.') + 1, dirent.name.length) // just extension
      const pngPath = path.join(avatarsFolder, avatarName + '.png')
      const thumbnail = fs.existsSync(pngPath) ? fs.readFileSync(pngPath) : Buffer.from([])

      return {
        avatar: fs.readFileSync(path.join(avatarsFolder, dirent.name)),
        thumbnail,
        avatarName,
        avatarFileType,
        isPublicAvatar: true
      }
    })
  const promises: Promise<any>[] = []
  for (const avatar of avatarsToInstall) {
    promises.push(uploadAvatarStaticResource(app, avatar))
  }
  await Promise.all(promises)
}

export const uploadAvatarStaticResource = async (app: Application, data: AvatarUploadArguments, params?: Params) => {
  const key = `avatars/${data.userId ?? 'public'}/${data.avatarName}`
  logger.info('uploadAvatarStaticResource', key)

  // const thumbnail = await generateAvatarThumbnail(data.avatar as Buffer)
  // if (!thumbnail) throw new Error('Thumbnail generation failed - check the model')

  const name = data.avatarName ?? 'Avatar-' + Math.round(Math.random() * 10000)

  const modelPromise = addGenericAssetToS3AndStaticResources(app, data.avatar, {
    userId: data.userId!,
    key: `${key}.${data.avatarFileType ?? 'glb'}`,
    staticResourceType: 'avatar',
    contentType: CommonKnownContentTypes.glb,
    name
  })

  const thumbnailPromise = addGenericAssetToS3AndStaticResources(app, data.thumbnail, {
    userId: data.userId!,
    key: `${key}.${data.avatarFileType ?? 'glb'}.png`,
    staticResourceType: 'user-thumbnail',
    contentType: CommonKnownContentTypes.png,
    name
  })

  const [avatarURL, thumbnailURL] = await Promise.all([modelPromise, thumbnailPromise])

  logger.info(`Successfully uploaded avatar: ${avatarURL}`)

  return {
    avatarURL,
    thumbnailURL
  }
}

export const removeAvatarFromDatabase = async (app: Application, name: string) => {}

export const getAvatarFromStaticResources = async function (app: Application, name?: string): Promise<AvatarProps[]> {
  const nameQuery = name ? { name } : {}
  const avatarQueryResult = await app.service('static-resource').find({
    paginate: false,
    query: {
      $select: ['id', 'name', 'url', 'staticResourceType'],
      ...nameQuery,
      staticResourceType: {
        $in: ['user-thumbnail', 'avatar']
      }
    },
    isInternal: true
  })
  const avatars = avatarQueryResult.reduce((acc, curr) => {
    const val = acc[curr.name]
    const key = curr.staticResourceType === 'avatar' ? 'avatarURL' : 'thumbnailURL'
    return {
      ...acc,
      [curr.name]: {
        ...val,
        avatarId: curr.name,
        [key]: curr.url
      }
    }
  }, {})
  return Object.values(avatars) as AvatarProps[]
}
