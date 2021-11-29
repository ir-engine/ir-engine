import { ProjectEventHooks } from '@xrengine/projects/ProjectConfigInterface'
import { Application } from '@xrengine/server-core/declarations'
import path from 'path'
import { installAvatarsFromProject } from '@xrengine/server-core/src/user/avatar/avatar-helper'

const avatarsFolder = path.resolve(__dirname, 'avatars')

const config = {
  onInstall: (app: Application) => {
    return installAvatarsFromProject(app, avatarsFolder)
  }
  // TODO: remove avatars
  // onUninstall: (app: Application) => {
  // }
} as ProjectEventHooks

export default config
