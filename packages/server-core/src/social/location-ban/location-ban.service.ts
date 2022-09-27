// Initializes the `location-ban` service on dpath `/location-ban`
import { Application } from '../../../declarations'
import logger from '../../ServerLogger'
import { LocationBan } from './location-ban.class'
import locationBanDocs from './location-ban.docs'
import hooks from './location-ban.hooks'
import createModel from './location-ban.model'

// Add this service to the service type index
declare module '@xrengine/common/declarations' {
  interface ServiceTypes {
    'location-ban': LocationBan
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  /**
   * Initialize our service with any options it requires and docs
   */
  const event = new LocationBan(options, app)
  event.docs = locationBanDocs
  app.use('location-ban', event)

  /**
   * Get our initialized service so that we can register hooks
   */
  const service = app.service('location-ban')

  service.hooks(hooks)

  service.publish('created', async (data, params): Promise<any> => {
    try {
      return Promise.all([app.channel(`userIds/${data.userId}`).send({ locationBan: data })])
    } catch (err) {
      logger.error(err)
    }
  })
}
