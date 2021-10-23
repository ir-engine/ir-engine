import { Application } from '../../../declarations'
import { Scene } from './scene.class'
import projectDocs from './scene.docs'
import createModel from './scene.model'
import hooks from './scene.hooks'
import createAssetModel from './asset.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    scene: Scene
  }
  interface Models {
    scene: ReturnType<typeof createModel>
  }
}

export default (app: Application) => {
  createAssetModel(app)
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Vyacheslav Solovjov
   */
  const event = new Scene(options, app)
  event.docs = projectDocs

  app.use('scene', event)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Vyacheslav Solovjov
   */
  const service = app.service('scene')

  service.hooks(hooks)
}
