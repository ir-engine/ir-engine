import { Application } from '../../../declarations'
import { FileBrowserService } from './file-browser.class'
import hooks from './file-browser.hooks'

declare module '../../../declarations' {
  interface ServiceTypes {
    'file-browser': FileBrowserService
  }
}

export default (app: Application): any => {
  const fileBrowser = new FileBrowserService()
  // fileBrowser.docs = projectDocs

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Abhishek Pathak
   */
  app.use('file-browser', fileBrowser)

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Abhishek Pathak
   */
  const service = app.service('file-browser')

  service.hooks(hooks as any)
}
