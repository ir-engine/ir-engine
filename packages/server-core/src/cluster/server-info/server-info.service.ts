import { Application } from '../../../declarations'
import { ServerInfo } from './server-info.class'
import hooks from './server-info.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'server-info': ServerInfo
  }
}

export default (app: Application): void => {
  const options = {
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new ServerInfo(options, app)
  app.use('server-info', event)
  const service = app.service('server-info')
  service.hooks(hooks)
}
