import { Params } from '@feathersjs/feathers'
import fs from 'fs'
import path from 'path'

import { CommonKnownContentTypes } from '@xrengine/common/src/utils/CommonKnownContentTypes'

import { Application } from '../../../declarations'
import logger from '../../logger'
import { addGenericAssetToS3AndStaticResources } from '../../media/upload-asset/upload-asset.service'

export type AvatarCreateArguments = {
  modelResourceId?: string
  thumbnailResourceId?: string
  identifierName?: string
  name: string
  isPublicAvatar?: boolean
}

export type AvatarPatchArguments = {
  modelResourceId?: string
  thumbnailResourceId?: string
  identifierName?: string
  name?: string
  isPublicAvatar?: string
}

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
    promises.push(
      new Promise(async (resolve, reject) => {
        try {
          const newAvatar = await app.service('avatar').create({
            name: avatar.avatarName
          })
          avatar.avatarName = newAvatar.identifierName
          const [modelResource, thumbnailResource] = await uploadAvatarStaticResource(app, avatar)

          await app.service('avatar').patch(newAvatar.id, {
            modelResourceId: modelResource.id,
            thumbnailResourceId: thumbnailResource.id
          })
          resolve(null)
        } catch (err) {
          logger.error(err)
          reject(err)
        }
      })
    )
  }
  await Promise.all(promises)
}

export const uploadAvatarStaticResource = async (app: Application, data: AvatarUploadArguments, params?: Params) => {
  const name = data.avatarName ? data.avatarName : 'Avatar-' + Math.round(Math.random() * 100000)

  const key = `avatars/${data.userId ?? 'public'}/${name}`

  // const thumbnail = await generateAvatarThumbnail(data.avatar as Buffer)
  // if (!thumbnail) throw new Error('Thumbnail generation failed - check the model')

  const modelPromise = addGenericAssetToS3AndStaticResources(app, data.avatar, {
    userId: data.userId!,
    key: `${key}.${data.avatarFileType ?? 'glb'}`,
    contentType: CommonKnownContentTypes.glb
  })

  const thumbnailPromise = addGenericAssetToS3AndStaticResources(app, data.thumbnail, {
    userId: data.userId!,
    key: `${key}.${data.avatarFileType ?? 'glb'}.png`,
    contentType: CommonKnownContentTypes.png
  })

  const [modelResource, thumbnailResource] = await Promise.all([modelPromise, thumbnailPromise])

  logger.info('Successfully uploaded avatar %o %o', modelResource, thumbnailResource)

  return [modelResource, thumbnailResource]
}

export const removeAvatarFromDatabase = async (app: Application, name: string) => {}
