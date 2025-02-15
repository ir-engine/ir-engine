import { avatarPath } from '@ir-engine/common/src/schema.type.module'
import { Application } from '@ir-engine/server-core/declarations'
import appRootPath from 'app-root-path'
import fs from 'fs'
import path from 'path'
import { patchStaticResourceAsAvatar, supportedAvatars } from '../user/avatar/avatar-helper'

const projectRelativeFolder = path.resolve(appRootPath.path, 'packages/projects')

export default async function (app: Application, avatarsFolder: string, manifestName: string) {
  await Promise.all(
    fs
      .readdirSync(avatarsFolder)
      .filter((file) => supportedAvatars.includes(file.split('.').pop()!))
      .map((file) =>
        patchStaticResourceAsAvatar(
          app,
          manifestName,
          path.resolve(avatarsFolder, file).replace(projectRelativeFolder + '/', '')
        )
      )
  )
  const existingAvatars = await app.service(avatarPath).find({
    query: {
      isPublic: true,
      project: manifestName
    },
    paginate: false
  })
  await Promise.all(
    existingAvatars.map(async (existingAvatar) => {
      if (!existingAvatar.modelResource && !existingAvatar.thumbnailResource)
        return await app.service(avatarPath).remove(existingAvatar.id)
      else return Promise.resolve()
    })
  )
}
