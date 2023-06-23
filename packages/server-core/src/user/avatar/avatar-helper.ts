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

import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'

import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'

import { Application } from '../../../declarations'
import { isAssetFromProject } from '../../media/static-resource/static-resource-helper'
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
  path?: string
}

// todo: move this somewhere else
const supportedAvatars = ['glb', 'gltf', 'vrm', 'fbx']
const projectsPath = path.join(appRootPath.path, '/packages/projects/projects/')

/**
 * @todo - reference dependency files in static resources?
 * @param app
 * @param avatarsFolder
 */
export const installAvatarsFromProject = async (app: Application, avatarsFolder: string) => {
  const projectName = avatarsFolder.replace(projectsPath, '').split('/')[0]!

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
        dependencies,
        avatarsFolder: avatarsFolder.replace(path.join(appRootPath.path, 'packages/projects'), '')
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

  /**
   * @todo
   * - check if avatar already exists by getting avatar with same key & hash in static resources
   * -
   */
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
        console.log({ existingAvatar })
        let selectedAvatar
        if (!existingAvatar) {
          selectedAvatar = await app.service('avatar').create({
            name: avatar.avatarName,
            isPublic: true,
            project: projectName || null!
          })
        } else {
          // todo - clean up old avatar files
          selectedAvatar = existingAvatar
        }

        await uploadDependencies(avatar.dependencies)

        await uploadAvatarStaticResource(app, {
          avatar: avatar.avatar,
          thumbnail: avatar.thumbnail,
          avatarName: avatar.avatarName,
          isPublic: true,
          avatarFileType: avatar.avatarFileType,
          avatarId: selectedAvatar.id,
          project: projectName,
          path: avatar.avatarsFolder
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
  console.log('uploadAvatarStaticResource', data)
  const name = data.avatarName ? data.avatarName : 'Avatar-' + Math.round(Math.random() * 100000)

  const staticResourceKey = `static-resources/avatar/${data.isPublic ? 'public' : params?.user!.id}/`
  const isFromProject = !!data.project && !!data.path && isAssetFromProject(data.path, data.project)
  const path = isFromProject ? data.path! : staticResourceKey

  // const thumbnail = await generateAvatarThumbnail(data.avatar as Buffer)
  // if (!thumbnail) throw new Error('Thumbnail generation failed - check the model')

  const [modelResource, thumbnailResource] = await Promise.all([
    addAssetAsStaticResource(
      app,
      {
        buffer: data.avatar,
        originalname: `${name}.${data.avatarFileType ?? 'glb'}`,
        mimetype: CommonKnownContentTypes[data.avatarFileType ?? 'glb'],
        size: data.avatar.byteLength
      },
      {
        userId: params?.user!.id,
        path,
        project: data.project
      }
    ),
    addAssetAsStaticResource(
      app,
      {
        buffer: data.thumbnail,
        originalname: `${name}.png`,
        mimetype: CommonKnownContentTypes.png,
        size: data.thumbnail.byteLength
      },
      {
        userId: params?.user!.id,
        path,
        project: data.project
      }
    )
  ])

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
