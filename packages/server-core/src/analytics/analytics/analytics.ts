import { analyticsMethods, analyticsPath } from '@etherealengine/engine/src/schemas/analytics/analytics.schema'

import { Application } from '../../../declarations'
import { AnalyticsService } from './analytics.class'
import analyticsDocs from './analytics.docs'
import hooks from './analytics.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    [analyticsPath]: AnalyticsService
  }
}

export default (app: Application): void => {
  const options = {
    name: analyticsPath,
    paginate: app.get('paginate'),
    Model: app.get('knexClient'),
    multi: true
  }

  //@ts-ignore
  app.use(analyticsPath, new AnalyticsService(options, app), {
    // A list of all methods this service exposes externally
    methods: analyticsMethods,
    // You can add additional custom events to be sent to clients here
    events: [],
    docs: analyticsDocs
  })

  const service = app.service(analyticsPath)
  service.hooks(hooks)
}
