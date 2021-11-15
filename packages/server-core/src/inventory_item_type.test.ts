import assert from 'assert'
import app from "../../server/src/app"

var dataToBeSent = {
  "inventoryItemTypeId" : null
}
var toBeDeleted = null

describe('Check Inventory Item Type', () => {

      // Check inventory-item-type
      it('should initialise inventory item type', async () => {
        const service = await app.service('inventory-item-type')
        assert.ok(service, 'Registered the service');
      })

      // Creating an item in inventory item type
       it('should create an inventory item type', async () => {
         const item = await app.service('inventory-item-type').create({
           "inventoryItemType": "skill inventory x500"
         });
         dataToBeSent.inventoryItemTypeId = item.inventoryItemTypeId
         assert.ok(item.inventoryItemTypeId, "Should return a unique Id");
       })

       // Creating an item in inventory item type
       it('should create an inventory item type', async () => {
        const item = await app.service('inventory-item-type').create({
          "inventoryItemType": "skill inventory x1000"
        });
        toBeDeleted = item.inventoryItemTypeId
        assert.ok(item.inventoryItemTypeId, "Should return a unique Id");
      })

      // Must delete an existing inventory item type
       it('should delete an inventory item type', async () => {
         const item = await app.service('inventory-item-type').remove(toBeDeleted);
         assert.ok(item, "Item is deleted");
       })

})

export default dataToBeSent