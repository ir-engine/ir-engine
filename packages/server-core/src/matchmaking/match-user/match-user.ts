import { matchUserMethods, matchUserPath } from '@etherealengine/engine/src/schemas/matchmaking/match-user.schema'

import { Application } from '../../../declarations'
import { MatchUserService } from './match-user.class'
import matchUserDocs from './match-user.docs'
import hooks from './match-user.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [matchUserPath]: MatchUserService
  }
}

export default (app: Application): void => {
  const options = {
    name: matchUserPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(matchUserPath, new MatchUserService(options), {
    // A list of all methods this service exposes externally
    methods: matchUserMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: matchUserDocs
  })

  const service = app.service(matchUserPath)
  service.hooks(hooks)
}
