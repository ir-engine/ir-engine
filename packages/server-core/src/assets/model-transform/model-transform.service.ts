import { Application } from '../../../declarations'
import { ModelTransform } from './model-transform.class'
import hooks from './model-transform.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'model-transform': ModelTransform
  }
}

export default (app: Application) => {
  const libClass = new ModelTransform(app)
  app.use('model-transform', libClass)
  const service = app.service('model-transform')
  service.hooks(hooks)
}
