import { Application } from '../../../declarations'
import { InventoryItem } from './inventory-item.class'
import createModel from './inventory-item.model'
import hooks from './inventory-item.hooks'
import inventoryItemDocs from './inventory-item.docs'
//test
declare module '../../../declarations' {
  interface ServiceTypes {
    inventoryItem: InventoryItem
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
  const event = new InventoryItem(options, app)
  event.docs = inventoryItemDocs
  app.use('inventory-item', event)

  const service = app.service('inventory-item')
  service.hooks(hooks)
}
