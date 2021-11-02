import assert from 'assert'
import app from "../../server/src/app"

describe('Check Inventory Item', () => {

  // Check inventory-item
  it('should initialise inventory item', async () => {
    const service = await app.service('inventory-item')
    assert.ok(service, 'Registered the service');
  })

  // Creating an item in inventory item
   it('should create an inventory item', async () => {
     const item = await app.service('inventory-item').create(
       {
         "inventoryItemTypeId": "3fba3580-3b3b-11ec-956d-bd63c686b264",
         "name": "Angry",
         "metadata": {"eyes":"joy","mouth":"surprised","level":2,"stamina":9.3},
         "description": "angry",
         "url": "https://arkh-frontend.s3.us-west-1.amazonaws.com/spacejet/new1.png"
     }
     );
     assert.ok(item.inventoryItemId, "Should return a unique Id");
   })

  // Removed  an existing and valid inventory item.
   it('should delete an inventory item', async () => {
     const item = await app.service('inventory-item').remove('33c49a60-3b39-11ec-956d-bd63c686b264');
     assert.ok(item, "Inventory Item is deleted");
   })

})