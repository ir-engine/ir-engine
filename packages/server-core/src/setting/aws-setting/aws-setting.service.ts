import { Application } from '../../../declarations'
import { Aws } from './aws-setting.class'
import hooks from './aws-setting.hooks'
import createModel from './aws-setting.model'

declare module '../../../declarations' {
  interface SerViceTypes {
    Aws: Aws
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new Aws(options, app)
  app.use('aws-setting', event)
  const service = app.service('aws-setting')
  service.hooks(hooks)
}
