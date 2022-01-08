import { Application } from '../../../declarations'
import { ClientSetting } from './client-setting.class'
import hooks from './client-setting.hooks'
import createModel from './client-setting.model'

declare module '../../../declarations' {
  interface SerViceTypes {
    client: ClientSetting
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new ClientSetting(options, app)
  app.use('client-setting', event)

  const service = app.service('client-setting')
  service.hooks(hooks)
}
