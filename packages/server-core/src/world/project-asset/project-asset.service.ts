import { Application } from '../../../declarations'
import createAssetModel from './asset.model'
import { ProjectAsset } from './project-asset.class'
import hooks from './project-asset.hooks'
import createModel from './project-asset.model'

declare module '../../../declarations' {
  interface ServiceTypes {
    'project-asset': ProjectAsset
  }
}

export default (app: Application): any => {
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
  app.use('project-asset', new ProjectAsset(options, app))

  const service = app.service('project-asset')

  service.hooks(hooks)
}
