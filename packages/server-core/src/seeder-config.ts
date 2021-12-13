import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import { mediaSeeds } from './media/seeder-config'
import { networkingSeeds } from './networking/seeder-config'
import { paymentSeeds } from './payments/seeder-config'
import { socialSeeds } from './social/seeder-config'
import { userSeeds } from './user/seeder-config'
import { worldSeeds } from './world/seeder-config'
import { scopeSeeds } from './scope/seeder-config'
import { settingSeeds } from './setting/seeder-config'
import { analyticsSeeds } from './analytics/seeder-config'
import { routeSeeds } from './route/seeder-config'

import fs from 'fs'
import path from 'path'
import { ProjectConfigInterface } from '@xrengine/projects/ProjectConfigInterface'

const installedProjects = fs.existsSync(path.resolve(__dirname, '../../projects/projects'))
  ? fs
      .readdirSync(path.resolve(__dirname, '../../projects/projects'), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => {
        try {
          const config: ProjectConfigInterface =
            require(`../../projects/projects/${dirent.name}/xrengine.config.ts`).default
          if (!config.databaseSeed) return null
          return path.join(dirent.name, config.databaseSeed)
        } catch (e) {
          // console.log(e)
        }
      })
      .filter((hasServices) => !!hasServices)
      .map((seedDir) => require(`../../projects/projects/${seedDir}`).default)
      .flat()
  : []

export const seeds: Array<ServicesSeedConfig> = [
  ...mediaSeeds,
  ...networkingSeeds,
  ...paymentSeeds,
  ...socialSeeds,
  ...userSeeds,
  ...worldSeeds,
  ...scopeSeeds,
  ...settingSeeds,
  ...analyticsSeeds,
  ...routeSeeds,
  ...installedProjects
]

export default seeds
