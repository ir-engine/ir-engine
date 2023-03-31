import fs from 'fs'
import path from 'path'

import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'

import { Application } from '../../../declarations'
import { addGenericAssetToS3AndStaticResources } from '../../media/upload-asset/upload-asset.service'
import { getProjectPackageJson } from '../../projects/project/project-helper'
import logger from '../../ServerLogger'
import { UserParams } from '../user/user.class'

export type AvatarCreateArguments = {
  modelResourceId?: string
  thumbnailResourceId?: string
  identifierName?: string
  name: string
  isPublic?: boolean
  project?: string
}

export type AvatarPatchArguments = {
  modelResourceId?: string
  thumbnailResourceId?: string
  identifierName?: string
  name?: string
}

export type AvatarUploadArguments = {
  avatar: Buffer
  thumbnail: Buffer
  avatarName: string
  isPublic: boolean
  avatarFileType?: string
  avatarId?: string
  project?: string
}

// todo: move this somewhere else
const supportedAvatars = ['glb', 'gltf', 'vrm', 'fbx']
const PROJECT_NAME_REGEX = /projects\/([a-zA-Z0-9-_.]+)\/public\/avatars$/

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
        isPublic: true
      } as AvatarUploadArguments
    })
  const promises: Promise<any>[] = []
  const projectNameExec = PROJECT_NAME_REGEX.exec(avatarsFolder)
  let projectJSON
  if (projectNameExec) projectJSON = getProjectPackageJson(projectNameExec[1])
  let projectName
  if (projectJSON) projectName = projectJSON.name
  for (const avatar of avatarsToInstall) {
    promises.push(
      new Promise(async (resolve, reject) => {
        try {
          const existingAvatar = await app.service('avatar').Model.findOne({
            where: {
              name: avatar.avatarName,
              isPublic: avatar.isPublic,
              project: projectName || null
            }
          })
          let selectedAvatar
          if (!existingAvatar) {
            selectedAvatar = await app.service('avatar').create({
              name: avatar.avatarName,
              isPublic: avatar.isPublic,
              project: projectName || null
            })
          } else selectedAvatar = existingAvatar
          avatar.avatarName = selectedAvatar.identifierName
          avatar.project = projectName || null
          const [modelResource, thumbnailResource] = await uploadAvatarStaticResource(app, avatar)

          await app.service('avatar').patch(selectedAvatar.id, {
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

export const uploadAvatarStaticResource = async (
  app: Application,
  data: AvatarUploadArguments,
  params?: UserParams
) => {
  const name = data.avatarName ? data.avatarName : 'Avatar-' + Math.round(Math.random() * 100000)

  const key = `static-resources/avatar/${data.isPublic ? 'public' : params?.user!.id}/${name}`

  // const thumbnail = await generateAvatarThumbnail(data.avatar as Buffer)
  // if (!thumbnail) throw new Error('Thumbnail generation failed - check the model')

  const modelPromise = addGenericAssetToS3AndStaticResources(app, data.avatar, CommonKnownContentTypes.glb, {
    userId: params?.user!.id,
    key: `${key}.${data.avatarFileType ?? 'glb'}`,
    staticResourceType: 'avatar',
    project: data.project
  })

  const thumbnailPromise = addGenericAssetToS3AndStaticResources(app, data.thumbnail, CommonKnownContentTypes.png, {
    userId: params?.user!.id,
    key: `${key}.${data.avatarFileType ?? 'glb'}.png`,
    staticResourceType: 'user-thumbnail',
    project: data.project
  })

  const [modelResource, thumbnailResource] = await Promise.all([modelPromise, thumbnailPromise])

  logger.info('Successfully uploaded avatar %o %o', modelResource, thumbnailResource)

  if (data.avatarId) {
    try {
      await app.service('avatar').patch(data.avatarId, {
        modelResourceId: modelResource.id,
        thumbnailResourceId: thumbnailResource.id
      })
    } catch (err) {}
  }

  return [modelResource, thumbnailResource]
}

export const removeAvatarFromDatabase = async (app: Application, name: string) => {}
