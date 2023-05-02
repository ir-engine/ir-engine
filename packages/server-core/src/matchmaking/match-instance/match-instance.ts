import {
  matchInstanceMethods,
  matchInstancePath
} from '@etherealengine/engine/src/schemas/matchmaking/match-instance.schema'

import { Application } from '../../../declarations'
import { MatchInstanceService } from './match-instance.class'
import matchInstanceDocs from './match-instance.docs'
import hooks from './match-instance.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [matchInstancePath]: MatchInstanceService
  }
}

export default (app: Application): void => {
  const options = {
    name: matchInstancePath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  app.use(matchInstancePath, new MatchInstanceService(options), {
    // A list of all methods this service exposes externally
    methods: matchInstanceMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: matchInstanceDocs
  })

  const service = app.service(matchInstancePath)
  service.hooks(hooks)
}
