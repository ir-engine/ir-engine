import { AnimationInterface } from '@etherealengine/common/src/dbmodels/Animation'

import { Application } from '../../../declarations'
import { Animation } from './animation.class'
import animationDocs from './animation.docs'
import hooks from './animation.hooks'
import createModel from './animation.model'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    animation: Animation
  }
  interface Models {
    animation: ReturnType<typeof createModel> & AnimationInterface
  }
}

export default (app: Application) => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new Animation(options, app)
  event.docs = animationDocs

  app.use('animation', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('animation')

  service.hooks(hooks)
}
