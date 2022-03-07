import { Application } from '../../../declarations'
import { ProjectSetting } from './project-setting.class'
import hooks from './project-setting.hooks'
import createModel from './project-setting.model'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'project-setting': ProjectSetting
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new ProjectSetting(options, app)
  app.use('project-setting', event)
  const service = app.service('project-setting')
  service.hooks(hooks)
}
