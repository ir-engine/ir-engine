import multer from 'multer'

import { Application } from '../../../declarations'
import { Archiver } from './archiver.class'
import hooks from './archiver.hooks'

declare module '@etherealengine/common/declarations' {
  interface ServiceTypes {
    archiver: Archiver
  }
}

const multipartMiddleware = multer({ limits: { fieldSize: Infinity, files: 1 } })

export default (app: Application): any => {
  const archiver = new Archiver(app)
  // fileBrowser.docs = projectDocs

  /**
   * Initialize our service with any options it requires and docs
   */
  app.use('archiver', archiver)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('archiver')

  service.hooks(hooks as any)
}
