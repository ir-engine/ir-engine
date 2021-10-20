import { Application } from '../declarations'
import AnalyticsServices from './analytics/services'
import EntityServices from './entities/services'
import MediaServices from './media/services'
import SocialServices from './social/services'
import SocialMediaServices from './socialmedia/services'
import UserServices from './user/services'
import BotService from './bot/services'
import ScopeService from './scope/service'
import SettingService from './setting/service'
import RouteService from './route/service'

export default (app: Application): void => {
  ;[
    ...AnalyticsServices,
    ...UserServices,
    ...MediaServices,
    ...EntityServices,
    ...SocialServices,
    ...SocialMediaServices,
    ...BotService,
    ...ScopeService,
    ...SettingService,
    ...RouteService
  ].forEach((service) => {
    app.configure(service)
  })
}
