import fs from 'fs'
import path from 'path'

import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'

import { Application } from '../../../declarations'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { addAssetAsStaticResource } from '../../media/upload-asset/upload-asset.service'
import { getProjectPackageJson } from '../../projects/project/project-helper'
import logger from '../../ServerLogger'
import { getContentType } from '../../util/fileUtils'
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

/**
 * @todo - reference dependency files in static resources?
 * @param app
 * @param avatarsFolder
 */
export const installAvatarsFromProject = async (app: Application, avatarsFolder: string) => {
  const promises: Promise<any>[] = []
  const projectNameExec = PROJECT_NAME_REGEX.exec(avatarsFolder)
  let projectJSON
  if (projectNameExec) projectJSON = getProjectPackageJson(projectNameExec[1])
  let projectName
  if (projectJSON) projectName = projectJSON.name

  // get all avatars files in the folder
  const avatarsToInstall = fs
    .readdirSync(avatarsFolder, { withFileTypes: true })
    .filter((dirent) => supportedAvatars.includes(dirent.name.split('.').pop()!))
    .map((dirent) => {
      const avatarName = dirent.name.substring(0, dirent.name.lastIndexOf('.')) // remove extension
      const avatarFileType = dirent.name.substring(dirent.name.lastIndexOf('.') + 1, dirent.name.length) // just extension
      const pngPath = path.join(avatarsFolder, avatarName + '.png')
      const thumbnail = fs.existsSync(pngPath) ? fs.readFileSync(pngPath) : Buffer.from([])
      const pathExists = fs.existsSync(path.join(avatarsFolder, avatarName))
      const dependencies = pathExists
        ? fs.readdirSync(path.join(avatarsFolder, avatarName), { withFileTypes: true }).map((dependencyDirent) => {
            return path.join(avatarsFolder, avatarName, dependencyDirent.name)
          })
        : []
      return {
        avatar: fs.readFileSync(path.join(avatarsFolder, dirent.name)),
        thumbnail,
        avatarName,
        avatarFileType,
        dependencies
      }
    })

  const provider = getStorageProvider()

  const uploadDependencies = (filePaths: string[]) =>
    Promise.all([
      provider.createInvalidation(filePaths),
      ...filePaths.map((filePath) => {
        const key = `static-resources/avatar/public${filePath.replace(avatarsFolder, '')}`
        const file = fs.readFileSync(filePath)
        const mimeType = getContentType(filePath)
        return provider.putObject(
          {
            Key: key,
            Body: file,
            ContentType: mimeType
          },
          {
            isDirectory: false
          }
        )
      })
    ])

  await Promise.all(
    avatarsToInstall.map(async (avatar) => {
      try {
        const existingAvatar = await app.service('avatar').Model.findOne({
          where: {
            name: avatar.avatarName,
            isPublic: true,
            project: projectName || null
          }
        })
        let selectedAvatar
        if (!existingAvatar) {
          selectedAvatar = await app.service('avatar').create({
            name: avatar.avatarName,
            isPublic: true,
            project: projectName || null
          })
        } else {
          // todo - clean up old avatar files
          selectedAvatar = existingAvatar
        }

        await uploadDependencies(avatar.dependencies)

        const [modelResource, thumbnailResource] = await uploadAvatarStaticResource(app, {
          avatar: avatar.avatar,
          thumbnail: avatar.thumbnail,
          avatarName: avatar.avatarName,
          isPublic: true,
          avatarFileType: avatar.avatarFileType,
          avatarId: selectedAvatar.id,
          project: projectName
        })

        await app.service('avatar').patch(selectedAvatar.id, {
          modelResourceId: modelResource.id,
          thumbnailResourceId: thumbnailResource.id
        })
      } catch (err) {
        logger.error(err)
      }
    })
  )
}

export const uploadAvatarStaticResource = async (
  app: Application,
  data: AvatarUploadArguments,
  params?: UserParams
) => {
  const name = data.avatarName ? data.avatarName : 'Avatar-' + Math.round(Math.random() * 100000)

  const key = `static-resources/avatar/${data.isPublic ? 'public' : params?.user!.id}/`

  // const thumbnail = await generateAvatarThumbnail(data.avatar as Buffer)
  // if (!thumbnail) throw new Error('Thumbnail generation failed - check the model')

  const modelPromise = addAssetAsStaticResource(
    app,
    [
      {
        buffer: data.avatar,
        originalname: `${name}.${data.avatarFileType ?? 'glb'}`,
        mimetype: CommonKnownContentTypes[data.avatarFileType ?? 'glb'],
        size: data.avatar.byteLength
      }
    ],
    {
      userId: params?.user!.id,
      path: key,
      staticResourceType: 'avatar',
      project: data.project
    }
  )

  const thumbnailPromise = addAssetAsStaticResource(
    app,
    [
      {
        buffer: data.thumbnail,
        originalname: `${name}.png`,
        mimetype: CommonKnownContentTypes.png,
        size: data.thumbnail.byteLength
      }
    ],
    {
      userId: params?.user!.id,
      path: key,
      staticResourceType: 'user-thumbnail',
      project: data.project
    }
  )

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
