// Initializes the `feed` service on path `/feed`
import { Application } from '../../../declarations'
import { Creator } from './creator.class'
import createModel from './creator.model'
import hooks from './creator.hooks'
import { Creator as CreatorInterface } from '@xrengine/common/src/interfaces/Creator'
import creatorDocs from './creator.docs'

// Add this service to the service type index
declare module '../../../declarations' {
  interface ServiceTypes {
    creator: CreatorInterface
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  const creator = new Creator(options, app)
  creator.docs = creatorDocs
  app.use('creator', creator)

  // Get our initialized service so that we can register hooks
  const service = app.service('creator')

  service.hooks(hooks)
}
