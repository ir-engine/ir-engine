import { Application } from '../../../declarations'
import { BuildStatus } from './build-status.class'
import hooks from './build-status.hooks'
import createModel from './build-status.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    'build-status': BuildStatus
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new BuildStatus(options, app)
  app.use('build-status', event)
  const service = app.service('build-status')
  service.hooks(hooks)
}
