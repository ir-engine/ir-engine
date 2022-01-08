import { Application } from '../../../declarations'
import { RedisSetting } from './redis-setting.class'
import hooks from './redis-setting.hooks'
import createModel from './redis-setting.model'

declare module '../../../declarations' {
  interface SerViceTypes {
    Redis: RedisSetting
  }
}

export default (app: Application): void => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  const event = new RedisSetting(options, app)
  app.use('redis-setting', event)
  const service = app.service('redis-setting')
  service.hooks(hooks)
}
