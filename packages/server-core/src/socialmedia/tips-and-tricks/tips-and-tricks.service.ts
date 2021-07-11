/**
 * @author Gleb Ordinsky <glebordinskijj@gmail.com>
 */
// Initializes the `tips-and-tricks` service on path `/tips-and-tricks`
import { ServiceAddons } from '@feathersjs/feathers'
import { Application } from '../../../declarations'
import { TipsAndTricks } from './tips-and-tricks.class'
import createModel from './tips-and-tricks.model'
import hooks from './tips-and-tricks.hooks'
import tips_and_tricksDocs from './tips-and-tricks.docs'

// Add this service to the service type index

declare module '../../../declarations' {
  interface ServiceTypes {
    tips_and_tricks: TipsAndTricks & ServiceAddons<any>
  }
}

export default function (app: Application): void {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate')
  }

  // Initialize our service with any options it requires
  const tips_and_tricks = new TipsAndTricks(options, app)
  tips_and_tricks.docs = tips_and_tricksDocs
  app.use('/tips-and-tricks', tips_and_tricks)

  // Get our initialized service so that we can register hooks
  const service = app.service('tips-and-tricks')

  service.hooks(hooks as any)
}
