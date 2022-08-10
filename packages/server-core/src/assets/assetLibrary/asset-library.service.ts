import { Application } from '../../../declarations'
import { AssetLibrary } from './asset-library.class'
import hooks from './asset-library.hooks'

declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'asset-library': AssetLibrary
  }
}

export default (app: Application) => {
  const libClass = new AssetLibrary(app)
  app.use('asset-library', libClass)
  const service = app.service('asset-library')
  service.hooks(hooks)
}
