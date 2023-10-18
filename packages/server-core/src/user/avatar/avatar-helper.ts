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

import { Paginated } from '@feathersjs/feathers'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

import { CommonKnownContentTypes } from '@etherealengine/common/src/utils/CommonKnownContentTypes'
import { avatarPath, AvatarType } from '@etherealengine/engine/src/schemas/user/avatar.schema'

import { Application } from '../../../declarations'
import { isAssetFromDomain } from '../../media/static-resource/static-resource-helper'
import { getStorageProvider } from '../../media/storageprovider/storageprovider'
import { addAssetAsStaticResource } from '../../media/upload-asset/upload-asset.service'
import logger from '../../ServerLogger'
import { getContentType } from '../../util/fileUtils'
import { AvatarParams } from './avatar.class'

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

/**
 * @todo - reference dependency files in static resources?
 * @param app
 * @param avatarsFolder
 */

// Retrieves avatars from avatarsFolder and returns an object
export const avatarUploadData = async (avatarsFolder: string) => {
  const supportedAvatarsModels = ['glb', 'gltf', 'vrm', 'fbx']
  // Gets all avatars files in the folder
  const dirents = await fs.promises.readdir(avatarsFolder, { withFileTypes: true })
  const avatarData = await Promise.all(
    dirents
      // Filter whats not avatar models
      .filter((dirent) => supportedAvatarsModels.includes(dirent.name.split('.').pop()!))
      .map(async (dirent) => {
        // Get avatar name
        const avatarName = dirent.name.substring(0, dirent.name.lastIndexOf('.'))
        // File type for model
        const avatarFileType = dirent.name.substring(dirent.name.lastIndexOf('.') + 1, dirent.name.length)
        // Checks for existing thumbnails for each model by creating path
        const pngPath = path.join(avatarsFolder, avatarName + '.png')
        // Try to read path with avatar model name.png
        const thumbnail = await fs.promises.readFile(pngPath).catch(() => Buffer.from([]))
        // Check if theres a dependency directory with the same name as avatar
        const pathExists = await fs.promises
          .access(path.join(avatarsFolder, avatarName))
          .then(() => true)
          .catch(() => false)
        // Create array with paths to dependencies
        const dependencies = pathExists
          ? (await fs.promises.readdir(path.join(avatarsFolder, avatarName), { withFileTypes: true })).map(
              (dependencyDirent) => {
                return path.join(avatarsFolder, avatarName, dependencyDirent.name)
              }
            )
          : []
        return {
          avatar: await fs.promises.readFile(path.join(avatarsFolder, dirent.name)),
          thumbnail,
          avatarName,
          avatarFileType,
          dependencies,
          avatarsFolder: avatarsFolder.replace(path.join(appRootPath.path, 'packages/projects'), '')
        }
      })
  )
  return avatarData
}

export const installAvatarsFromProject = async (app: Application, avatarsFolder: string) => {
  const projectsPath = path.join(appRootPath.path, '/packages/projects/projects/')
  const projectName = avatarsFolder.replace(projectsPath, '').split('/')[0]!

  const avatarsToInstall = await avatarUploadData(avatarsFolder)

  const provider = getStorageProvider()

  const uploadDependencies = (filePaths: string[]) => {
    return Promise.all([
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
  }

  /**
   * @todo
   * - check if avatar already exists by getting avatar with same key & hash in static resources
   * -
   */

  // Map through array of avatar data
  await Promise.all(
    avatarsToInstall.map(async (avatar) => {
      try {
        // Check if avatar exists by querrying service using array.individualData.name
        const existingAvatar = (await app.service(avatarPath).find({
          query: {
            name: avatar.avatarName,
            isPublic: true,
            $or: [
              {
                project: projectName
              },
              {
                project: ''
              }
            ]
          }
        })) as Paginated<AvatarType>
        console.log({ existingAvatar })

        let selectedAvatar: AvatarType
        if (existingAvatar && existingAvatar.data.length > 0) {
          // todo - clean up old avatar files
          selectedAvatar = existingAvatar.data[0]
        } else {
          selectedAvatar = await app.service(avatarPath).create({
            name: avatar.avatarName,
            isPublic: true,
            project: projectName || undefined
          })
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
  params?: AvatarParams
) => {
  console.log('uploadAvatarStaticResource', data)
  const name = data.avatarName ? data.avatarName : 'Avatar-' + uuidv4()
  const staticResourceKey = `static-resources/avatar/${data.isPublic ? 'public' : params?.user!.id}/`
  const isFromDomain = !!data.path && isAssetFromDomain(data.path)
  const path = isFromDomain ? data.path! : staticResourceKey

  // const thumbnail = await generateAvatarThumbnail(data.avatar as Buffer)
  // if (!thumbnail) throw new Error('Thumbnail generation failed - check the model')

  const [modelResource, thumbnailResource] = await Promise.all([
    // Add model to static resource
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
    // Add thumbnail to static resource
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

  // If avatarId exists then the resources are updated
  if (data.avatarId) {
    try {
      await app.service(avatarPath).patch(
        data.avatarId,
        {
          modelResourceId: modelResource.id,
          thumbnailResourceId: thumbnailResource.id
        },
        params
      )
    } catch (err) {
      console.log(err)
    }
  }

  return [modelResource, thumbnailResource]
}

export const removeAvatarFromDatabase = async (app: Application, name: string) => {}
