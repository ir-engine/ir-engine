import assert from 'assert'
import app from '../../server/src/app'
import dataToBeSent from './inventory-item-type.test'
import data from './inventory-item.test'

let dataToBeSent2 = data.dataToBeSent2

describe('Clean up database', () => {
  it('should delete an inventory item type', async () => {
    const item = await app.service('inventory-item-type').remove(dataToBeSent.inventoryItemTypeId)
    assert.ok(item, 'Item is deleted')
  })

  it('should delete an inventory item', async () => {
    const item = await app.service('inventory-item').remove(dataToBeSent2.inventoryItemId)
    assert.ok(item, 'Inventory Item is deleted')
  })
})
