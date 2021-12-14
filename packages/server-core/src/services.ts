import { Application } from '../declarations'
import AnalyticsServices from './analytics/services'
import EntityServices from './projects/services'
import MediaServices from './media/services'
import NetworkingServices from './networking/services'
import SocialServices from './social/services'
import UserServices from './user/services'
import WorldServices from './world/services'
import BotService from './bot/services'
import ScopeService from './scope/service'
import SettingService from './setting/service'
import RouteService from './route/service'
import MatchMakingServices from './matchmaking/services'

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
          if (!config.services) return null
          return path.join(dirent.name, config.services)
        } catch (e) {
          // console.log(e)
        }
      })
      .filter((hasServices) => !!hasServices)
      .map((servicesDir) => {
        return require(`../../projects/projects/${servicesDir}`).default
      })
      .flat()
  : []

export default (app: Application): void => {
  ;[
    ...AnalyticsServices,
    ...UserServices,
    ...MediaServices,
    ...WorldServices,
    ...EntityServices,
    ...NetworkingServices,
    ...SocialServices,
    ...BotService,
    ...ScopeService,
    ...SettingService,
    ...RouteService,
    ...installedProjects,
    ...MatchMakingServices
  ].forEach((service) => {
    app.configure(service)
  })
}
