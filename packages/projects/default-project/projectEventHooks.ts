import { ProjectEventHooks } from '@xrengine/projects/ProjectConfigInterface'
import { Application } from '@xrengine/server-core/declarations'
import fs from 'fs'
import path from 'path'
import { uploadAvatarStaticResource } from '@xrengine/server-core/src/user/avatar/avatar-helper'

const avatarsFolder = path.resolve(__dirname, 'avatars')

const config = {
  onInstall: async (app: Application) => {
    const avatarsToInstall = fs.readdirSync(avatarsFolder, { withFileTypes: true }).map((dirent) => {
      return {
        avatar: fs.readFileSync(path.join(avatarsFolder, dirent.name)),
        avatarName: dirent.name.replace(/\..+$/, ''), // remove extension
        isPublicAvatar: true
      }
    })
    const promises: Promise<any>[] = []
    for (const avatar of avatarsToInstall) {
      promises.push(uploadAvatarStaticResource(app, avatar))
    }
    await Promise.all(promises)
  },
  onUninstall: async (app: Application) => {
    // TODO: remove avatars
  }
} as ProjectEventHooks

export default config
