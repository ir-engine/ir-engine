/**
 * @author Tanya Vykliuk <tanya.vykliuk@gmail.com>
 */
import { Application } from '../../../declarations'
import { ArMedia } from './ar-media.class'
import createModel from './ar-media.model'
import hooks from './ar-media.hooks'
import feedDocs from './ar-media.docs'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    'ar-media': ArMedia
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  const feed = new ArMedia(options, app)
  feed.docs = feedDocs
  app.use('ar-media', feed)

  // Get our initialized service so that we can register hooks
  const service = app.service('ar-media')

  service.hooks(hooks)
}
