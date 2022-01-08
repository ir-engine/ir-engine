import { Application } from '../../../declarations'
import { UserSettings } from './user-settings.class'
import userSettingsDocs from './user-settings.docs'
import hooks from './user-settings.hooks'
import createModel from './user-settings.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    'user-settings': UserSettings
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }
  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new UserSettings(options, app)
  event.docs = userSettingsDocs
  app.use('user-settings', event)

  const service = app.service('user-settings')

  service.hooks(hooks)
}
