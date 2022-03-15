import { Application } from '../../../declarations'
import { ProjectSetting } from './project-setting.class'
import hooks from './project-setting.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'project-setting': ProjectSetting
  }
}

export default (app: Application): void => {
  const options = {
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new ProjectSetting(options, app)
  app.use('project-setting', event)
  const service = app.service('project-setting')
  service.hooks(hooks)
}
