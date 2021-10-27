import { Application } from '../../../declarations'
import { UserInventory } from './user-inventory.class'
import createModel from './user-inventory.model'
import hooks from './user-inventory.hooks'
import userInventoryDocs from './user-inventory.docs'

declare module '../../../declarations' {
  interface ServiceTypes {
    'user-inventory': UserInventory 
  }
}

export default (app: Application): any => {
  const options = {
    Model: createModel(app),
    paginate: app.get('paginate'),
    multi: true
  }

  /**
   * Initialize our service with any options it requires and docs
   *
   * @author DRC
   */
  const event = new UserInventory(options, app)
  event.docs = userInventoryDocs 
  app.use('user-inventory', event)

  const service = app.service('user-inventory')

  service.hooks(hooks)
}