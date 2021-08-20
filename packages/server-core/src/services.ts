import { Application } from '../declarations'
import EntityServices from './entities/services'
import MediaServices from './media/services'
import NetworkingServices from './networking/services'
// import PaymentServices from './payments/services';
import SocialServices from './social/services'
import SocialMediaServices from './socialmedia/services'
import UserServices from './user/services'
import WorldServices from './world/services'
import BotService from './bot/services'
import ScopeService from './scope/service'

export default (app: Application): void => {
  ;[
    ...UserServices,
    ...MediaServices,
    ...WorldServices,
    ...EntityServices,
    ...NetworkingServices,
    // ...PaymentServices,
    ...SocialServices,
    ...SocialMediaServices,
    ...BotService,
    ...ScopeService
  ].forEach((service) => {
    app.configure(service)
  })
}
