import { Application } from '../../../declarations'
import { ContentPack } from './content-pack.class'
import hooks from './content-pack.hooks'

declare module '../../../declarations' {
  interface ServiceTypes {
    'content-pack': ContentPack
  }
}

export default (app: Application): void => {
  const contentPack = new ContentPack({}, app)
  app.use('content-pack', contentPack)

  const service = app.service('content-pack')

  ;(service as any).hooks(hooks)
}
