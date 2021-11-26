import { ProjectEventHooks } from '@xrengine/projects/ProjectConfigInterface'
import { Application } from '@xrengine/server-core/declarations'

const config = {
  onInstall: async (app: Application) => {
    console.log('onInstall hook called')
  },
  onUpdate: async (app: Application) => {
    console.log('onUpdate hook called')
  },
  onUninstall: async (app: Application) => {
    console.log('onUninstall hook called')
  }
} as ProjectEventHooks

export default config
