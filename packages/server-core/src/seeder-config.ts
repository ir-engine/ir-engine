import { ServicesSeedConfig } from '@xrengine/common/src/interfaces/ServicesSeedConfig'
import { mediaSeeds } from './media/seeder-config'
import { networkingSeeds } from './networking/seeder-config'
import { paymentSeeds } from './payments/seeder-config'
import { socialSeeds } from './social/seeder-config'
import { socialMediaSeeds } from './socialmedia/seeder-config'
import { userSeeds } from './user/seeder-config'
import { worldSeeds } from './world/seeder-config'
import { scopeSeeds } from './scope/seeder-config'
import { settingSeeds } from './setting/seeder-config'
import { analyticsSeeds } from './analytics/seeder-config'
import { routeSeeds } from './route/seeder-config'
import { projectSeeds } from './projects/seeder-config'

import fs from 'fs'
import path from 'path'

const installedProjects = fs.existsSync(path.resolve(__dirname, '../../projects/projects'))
  ? fs
      .readdirSync(path.resolve(__dirname, '../../projects/projects'), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => {
        console.log(dirent)
        if (fs.existsSync(path.resolve(__dirname, '../../projects/projects', dirent.name, 'services/seeder-config.ts')))
          return dirent.name
      })
      .filter((hasServices) => !!hasServices)
      .map((name) => require(`../../projects/projects/${name}/services/seeder-config.ts`).default)
      .flat()
  : []

export const seeds: Array<ServicesSeedConfig> = [
  ...mediaSeeds,
  ...networkingSeeds,
  ...paymentSeeds,
  ...socialSeeds,
  ...socialMediaSeeds,
  ...userSeeds,
  ...worldSeeds,
  ...scopeSeeds,
  ...settingSeeds,
  ...analyticsSeeds,
  ...routeSeeds,
  ...projectSeeds,
  ...installedProjects
]

export default seeds
