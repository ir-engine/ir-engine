import { Application } from '../../../declarations'
import { ServerLogs } from './server-logs.class'
import hooks from './server-logs.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'server-logs': ServerLogs
  }
}

export default (app: Application): void => {
  const options = {
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new ServerLogs(options, app)
  app.use('server-logs', event)
  const service = app.service('server-logs')
  service.hooks(hooks)
}
