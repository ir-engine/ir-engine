import { Application } from '../declarations'
import AnalyticsServices from './analytics/services'
import EntityServices from './projects/services'
import MediaServices from './media/services'
import NetworkingServices from './networking/services'
// import PaymentServices from './payments/services';
import SocialServices from './social/services'
import SocialMediaServices from './socialmedia/services'
import UserServices from './user/services'
import WorldServices from './world/services'
import BotService from './bot/services'
import ScopeService from './scope/service'
import SettingService from './setting/service'
import RouteService from './route/service'
import MatchMakingServices from './matchmaking/services'

import fs from 'fs'
import path from 'path'

const installedProjects = fs.existsSync(path.resolve(__dirname, '../../projects/projects'))
  ? fs
      .readdirSync(path.resolve(__dirname, '../../projects/projects'), { withFileTypes: true })
      .filter((dirent) => dirent.isDirectory())
      .map((dirent) => {
        console.log(dirent)
        if (fs.existsSync(path.resolve(__dirname, '../../projects/projects', dirent.name, 'services/services.ts')))
          return dirent.name
      })
      .filter((hasServices) => !!hasServices)
      .map((name) => require(`../../projects/projects/${name}/services/services.ts`).default)
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
    // ...PaymentServices,
    ...SocialServices,
    ...SocialMediaServices,
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
