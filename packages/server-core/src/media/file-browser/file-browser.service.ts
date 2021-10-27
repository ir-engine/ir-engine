import { Application } from '../../../declarations'
import { FileBrowserService } from './file-browser.class'
import hooks from './file-browser.hooks'

export default (app: Application): any => {
  const options = {
    Model: null,
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author Abhishek Pathak
   */
  const event = new FileBrowserService()
  app.use('/file-browser', new FileBrowserService())

  /**
   * Get our initialized service so that we can register hooks
   *
   * @author Abhishek Pathak
   */
  const service = app.service('file-browser')

  service.hooks(hooks as any)
}
